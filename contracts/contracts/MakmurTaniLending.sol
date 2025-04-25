// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./RWAFarmersToken.sol";

/**
 * @title MakmurTani Lending Platform
 * @dev Contract to facilitate microloans to farmers using their tokenized RWAs as collateral
 */
contract MakmurTaniLending is AccessControl, ReentrancyGuard, Pausable, IERC721Receiver {
    using Counters for Counters.Counter;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant RISK_MANAGER_ROLE = keccak256("RISK_MANAGER_ROLE");

    // State variables
    RWAFarmersToken public farmersToken;
    Counters.Counter private _loanIdCounter;
    
    // Tokens approved for lending
    mapping(address => bool) public approvedTokens;
    
    // Risk parameters
    mapping(address => uint256) public loanToValueRatios; // In basis points (e.g., 7500 = 75%)
    mapping(address => uint256) public interestRates; // Annual interest rate in basis points
    mapping(address => uint256) public liquidationThresholds; // In basis points

    enum LoanStatus {
        Active,
        Repaid,
        Defaulted,
        Liquidated
    }

    struct Loan {
        uint256 loanId;
        uint256 tokenId; // Collateral token ID
        address borrower;
        address lender;
        address loanToken; // The ERC20 token used for the loan
        uint256 principalAmount;
        uint256 interestRate; // Annual interest rate in basis points
        uint256 originationFee; // In basis points
        uint256 startTime;
        uint256 durationDays;
        uint256 collateralValue;
        LoanStatus status;
        uint256 amountRepaid;
        uint256 lastUpdated;
    }

    // Mappings
    mapping(uint256 => Loan) public loans; // loanId => Loan
    mapping(uint256 => bool) public tokenIsCollateral; // tokenId => isCollateral
    mapping(address => uint256[]) public borrowerLoans; // borrower => loanIds
    mapping(address => uint256[]) public lenderLoans; // lender => loanIds

    // Events
    event LoanCreated(
        uint256 indexed loanId,
        uint256 indexed tokenId,
        address indexed borrower,
        address lender,
        address loanToken,
        uint256 principalAmount,
        uint256 durationDays
    );
    event LoanFunded(
        uint256 indexed loanId,
        address indexed lender,
        uint256 principalAmount
    );
    event LoanRepaid(
        uint256 indexed loanId,
        uint256 repaymentAmount,
        uint256 timestamp
    );
    event CollateralLiquidated(
        uint256 indexed loanId,
        uint256 indexed tokenId,
        address liquidator,
        uint256 liquidationAmount
    );
    event TokenApprovalStatusChanged(address token, bool isApproved);
    event RiskParametersUpdated(
        address token,
        uint256 loanToValueRatio,
        uint256 interestRate,
        uint256 liquidationThreshold
    );

    /**
     * @dev Constructor
     * @param _farmersToken Address of the RWAFarmersToken contract
     */
    constructor(address _farmersToken) {
        require(_farmersToken != address(0), "Invalid token address");
        
        farmersToken = RWAFarmersToken(_farmersToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(RISK_MANAGER_ROLE, msg.sender);
    }

    /**
     * @dev Allows the borrower to create a loan request using their tokenized asset as collateral
     * @param tokenId ID of the token to use as collateral
     * @param loanToken Address of the token to borrow
     * @param principalAmount Amount to borrow
     * @param durationDays Loan duration in days
     */
    function createLoan(
        uint256 tokenId,
        address loanToken,
        uint256 principalAmount,
        uint256 durationDays
    ) external whenNotPaused nonReentrant {
        require(approvedTokens[loanToken], "Token not approved for lending");
        require(principalAmount > 0, "Principal must be greater than zero");
        require(durationDays > 0 && durationDays <= 365, "Invalid duration");
        require(!tokenIsCollateral[tokenId], "Token already used as collateral");
        
        // Check that borrower owns the token
        require(
            farmersToken.ownerOf(tokenId) == msg.sender,
            "Not the token owner"
        );
        
        // Check that the token is verified
        RWAFarmersToken.Params memory params = farmersToken.getParams(tokenId);
        require(params.metadata.verified, "Asset not verified");
        
        // Calculate collateral value based on asset type and metadata
        uint256 collateralValue = calculateCollateralValue(tokenId);
        
        // Check loan-to-value ratio
        uint256 maxLoanAmount = (collateralValue * loanToValueRatios[loanToken]) / 10000;
        require(principalAmount <= maxLoanAmount, "Loan amount exceeds maximum");
        
        // Create the loan
        uint256 loanId = _loanIdCounter.current();
        _loanIdCounter.increment();
        
        Loan memory loan = Loan({
            loanId: loanId,
            tokenId: tokenId,
            borrower: msg.sender,
            lender: address(0), // Will be set when funded
            loanToken: loanToken,
            principalAmount: principalAmount,
            interestRate: interestRates[loanToken],
            originationFee: 100, // 1% origination fee
            startTime: 0, // Will be set when funded
            durationDays: durationDays,
            collateralValue: collateralValue,
            status: LoanStatus.Active,
            amountRepaid: 0,
            lastUpdated: block.timestamp
        });
        
        loans[loanId] = loan;
        tokenIsCollateral[tokenId] = true;
        borrowerLoans[msg.sender].push(loanId);
        
        // Transfer token to this contract as collateral
        farmersToken.safeTransferFrom(msg.sender, address(this), tokenId);
        
        emit LoanCreated(
            loanId,
            tokenId,
            msg.sender,
            address(0),
            loanToken,
            principalAmount,
            durationDays
        );
    }

    /**
     * @dev Allows a lender to fund a loan
     * @param loanId ID of the loan to fund
     */
    function fundLoan(uint256 loanId) external whenNotPaused nonReentrant {
        Loan storage loan = loans[loanId];
        
        require(loan.loanId == loanId, "Loan does not exist");
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(loan.lender == address(0), "Loan already funded");
        require(loan.borrower != msg.sender, "Cannot fund own loan");
        
        // Check lender allowance and balance
        IERC20 loanToken = IERC20(loan.loanToken);
        require(
            loanToken.allowance(msg.sender, address(this)) >= loan.principalAmount,
            "Insufficient allowance"
        );
        require(
            loanToken.balanceOf(msg.sender) >= loan.principalAmount,
            "Insufficient balance"
        );
        
        // Update loan details
        loan.lender = msg.sender;
        loan.startTime = block.timestamp;
        loan.lastUpdated = block.timestamp;
        
        // Add to lender's loans
        lenderLoans[msg.sender].push(loanId);
        
        // Calculate origination fee
        uint256 feeAmount = (loan.principalAmount * loan.originationFee) / 10000;
        uint256 borrowerAmount = loan.principalAmount - feeAmount;
        
        // Transfer tokens from lender to contract
        require(
            loanToken.transferFrom(msg.sender, address(this), loan.principalAmount),
            "Transfer from lender failed"
        );
        
        // Transfer principal minus fee to borrower
        require(
            loanToken.transfer(loan.borrower, borrowerAmount),
            "Transfer to borrower failed"
        );
        
        emit LoanFunded(loanId, msg.sender, loan.principalAmount);
    }

    /**
     * @dev Allows a borrower to repay their loan
     * @param loanId ID of the loan to repay
     * @param amount Amount to repay
     */
    function repayLoan(uint256 loanId, uint256 amount) external whenNotPaused nonReentrant {
        Loan storage loan = loans[loanId];
        
        require(loan.loanId == loanId, "Loan does not exist");
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(loan.borrower == msg.sender, "Not the borrower");
        require(loan.lender != address(0), "Loan not funded");
        
        // Calculate total repayment amount
        uint256 interest = calculateInterest(loan);
        uint256 totalDue = loan.principalAmount + interest - loan.amountRepaid;
        
        // Check if repayment amount is valid
        require(amount > 0, "Amount must be greater than zero");
        require(amount <= totalDue, "Amount exceeds remaining balance");
        
        // Check allowance and balance
        IERC20 loanToken = IERC20(loan.loanToken);
        require(
            loanToken.allowance(msg.sender, address(this)) >= amount,
            "Insufficient allowance"
        );
        require(
            loanToken.balanceOf(msg.sender) >= amount,
            "Insufficient balance"
        );
        
        // Transfer repayment amount from borrower to contract
        require(
            loanToken.transferFrom(msg.sender, address(this), amount),
            "Transfer from borrower failed"
        );
        
        // Update loan details
        loan.amountRepaid += amount;
        loan.lastUpdated = block.timestamp;
        
        // Check if loan is fully repaid
        if (loan.amountRepaid >= loan.principalAmount + interest) {
            // Loan is fully repaid
            loan.status = LoanStatus.Repaid;
            
            // Transfer collateral back to borrower
            farmersToken.safeTransferFrom(address(this), loan.borrower, loan.tokenId);
            tokenIsCollateral[loan.tokenId] = false;
            
            // Transfer full repayment to lender
            require(
                loanToken.transfer(loan.lender, loan.principalAmount + interest),
                "Transfer to lender failed"
            );
        }
        
        emit LoanRepaid(loanId, amount, block.timestamp);
    }

    /**
     * @dev Allows a loan to be liquidated if it is defaulted
     * @param loanId ID of the loan to liquidate
     */
    function liquidateLoan(uint256 loanId) external whenNotPaused nonReentrant {
        Loan storage loan = loans[loanId];
        
        require(loan.loanId == loanId, "Loan does not exist");
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(isDefaulted(loan), "Loan not defaulted");
        
        // Mark as liquidated
        loan.status = LoanStatus.Liquidated;
        loan.lastUpdated = block.timestamp;
        
        // Transfer collateral to lender
        farmersToken.safeTransferFrom(address(this), loan.lender, loan.tokenId);
        tokenIsCollateral[loan.tokenId] = false;
        
        emit CollateralLiquidated(loanId, loan.tokenId, msg.sender, loan.principalAmount);
    }

    /**
     * @dev Approves a token for lending
     * @param token Token address to approve
     * @param loanToValueRatio Loan-to-value ratio in basis points
     * @param interestRate Annual interest rate in basis points
     * @param liquidationThreshold Threshold for liquidation in basis points
     */
    function approveToken(
        address token,
        uint256 loanToValueRatio,
        uint256 interestRate,
        uint256 liquidationThreshold
    ) external onlyRole(RISK_MANAGER_ROLE) {
        require(token != address(0), "Invalid token address");
        require(loanToValueRatio <= 8000, "LTV too high"); // Max 80% LTV
        require(interestRate <= 5000, "Interest rate too high"); // Max 50% APR
        require(liquidationThreshold > loanToValueRatio, "Invalid liquidation threshold");
        
        approvedTokens[token] = true;
        loanToValueRatios[token] = loanToValueRatio;
        interestRates[token] = interestRate;
        liquidationThresholds[token] = liquidationThreshold;
        
        emit TokenApprovalStatusChanged(token, true);
        emit RiskParametersUpdated(token, loanToValueRatio, interestRate, liquidationThreshold);
    }

    /**
     * @dev Removes a token from approved list
     * @param token Token address to remove
     */
    function removeToken(address token) external onlyRole(RISK_MANAGER_ROLE) {
        approvedTokens[token] = false;
        emit TokenApprovalStatusChanged(token, false);
    }

    /**
     * @dev Updates risk parameters for a token
     * @param token Token address to update
     * @param loanToValueRatio New loan-to-value ratio
     * @param interestRate New interest rate
     * @param liquidationThreshold New liquidation threshold
     */
    function updateRiskParameters(
        address token,
        uint256 loanToValueRatio,
        uint256 interestRate,
        uint256 liquidationThreshold
    ) external onlyRole(RISK_MANAGER_ROLE) {
        require(approvedTokens[token], "Token not approved");
        require(loanToValueRatio <= 8000, "LTV too high"); // Max 80% LTV
        require(interestRate <= 5000, "Interest rate too high"); // Max 50% APR
        require(liquidationThreshold > loanToValueRatio, "Invalid liquidation threshold");
        
        loanToValueRatios[token] = loanToValueRatio;
        interestRates[token] = interestRate;
        liquidationThresholds[token] = liquidationThreshold;
        
        emit RiskParametersUpdated(token, loanToValueRatio, interestRate, liquidationThreshold);
    }

    /**
     * @dev Pauses the contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses the contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Gets all loans of a borrower
     * @param borrower Address of the borrower
     * @return Array of loan IDs
     */
    function getBorrowerLoans(address borrower) external view returns (uint256[] memory) {
        return borrowerLoans[borrower];
    }

    /**
     * @dev Gets all loans funded by a lender
     * @param lender Address of the lender
     * @return Array of loan IDs
     */
    function getLenderLoans(address lender) external view returns (uint256[] memory) {
        return lenderLoans[lender];
    }

    /**
     * @dev Gets loan details by ID
     * @param loanId ID of the loan
     * @return The loan details
     */
    function getLoanDetails(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }

    /**
     * @dev Calculates the total interest for a loan
     * @param loan The loan to calculate interest for
     * @return The total interest amount
     */
    function calculateInterest(Loan memory loan) public view returns (uint256) {
        if (loan.startTime == 0) {
            return 0; // Loan not funded yet
        }
        
        uint256 elapsedDays = (block.timestamp - loan.startTime) / 1 days;
        if (elapsedDays > loan.durationDays) {
            elapsedDays = loan.durationDays;
        }
        
        return (loan.principalAmount * loan.interestRate * elapsedDays) / (10000 * 365);
    }

    /**
     * @dev Checks if a loan is defaulted
     * @param loan The loan to check
     * @return True if the loan is defaulted, false otherwise
     */
    function isDefaulted(Loan memory loan) public view returns (bool) {
        if (loan.startTime == 0 || loan.status != LoanStatus.Active) {
            return false;
        }
        
        uint256 elapsedDays = (block.timestamp - loan.startTime) / 1 days;
        return elapsedDays > loan.durationDays;
    }

    /**
     * @dev Calculates the collateral value of a tokenized asset
     * @param tokenId ID of the token
     * @return The calculated collateral value
     */
    function calculateCollateralValue(uint256 tokenId) public view returns (uint256) {
        RWAFarmersToken.Params memory params = farmersToken.getParams(tokenId);
        
        // Base calculation depending on asset type
        if (params.metadata.assetType == RWAFarmersToken.AssetType.Farmland) {
            // Value based on land area (assuming area is in square meters)
            // Using a simple calculation of $5 per square meter as an example
            return params.metadata.area * 5 * 10**18; // Convert to wei
        } else if (params.metadata.assetType == RWAFarmersToken.AssetType.Crop) {
            // Value based on expected yield and current market prices
            // For simplicity, using a fixed value per unit
            return params.metadata.area * 2 * 10**18; // Convert to wei
        } else {
            // Equipment or other asset types
            // Using a fixed value for simplicity
            return 1000 * 10**18; // Convert to wei
        }
    }

    /**
     * @dev Implementation of IERC721Receiver
     */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        return this.onERC721Received.selector;
    }
} 