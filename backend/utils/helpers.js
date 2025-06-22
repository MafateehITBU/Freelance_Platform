const helpers = {
  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  validatePhone: (phone) => {
    const re = /^07[789]\d{7}$/;
    return re.test(phone);
  },
  validatePassword: (password) => {
    const re = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(password);
  },
  validateDOB: (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    const age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    return age >= 16 || (age === 16 && m >= 0);
  },
  validateCardNumber: (cardNumber) => {
    const re = /^\d{16}$/;
    return re.test(cardNumber);
  },
  validateCVV: (cvv) => {
    const re = /^\d{3,4}$/; // 3 digits for Visa/MasterCard, 4 for AmEx
    return re.test(cvv);
  },
  validateExpiryDate: (expiry) => {
    // Format: MM/YY or MM/YYYY
    const re = /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/;
    if (!re.test(expiry)) return false;

    const [month, year] = expiry.split('/');
    const now = new Date();
    const inputMonth = parseInt(month, 10);
    const inputYear = parseInt(year.length === 2 ? '20' + year : year, 10);

    const expiryDate = new Date(inputYear, inputMonth);
    return expiryDate > now;
  },
};

export default helpers;