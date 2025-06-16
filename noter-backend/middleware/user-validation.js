module.exports = async (request, response, next) => {
  function isNameValid(name) {
    return /^\s*([A-Za-z]{1,}([\.,] |[-']| )?)+[A-Za-z]+\.?\s*$/.test(name);
  }

  function isEmailAddressValid(emailAddress) {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
      emailAddress
    );
  }

  function isPasswordValid(password) {
    return /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*\-_.?]).{8,50}$/.test(
      password
    );
  }

  if (request.path === "/api/user/new") {
    const { name, emailAddress, password, confirmPassword } = request.body;

    if (![name, emailAddress, password, confirmPassword].every(Boolean))
      return response.status(422).json({ message: "Missing credentials" });
    else if (!isNameValid(name))
      return response.status(422).json({ message: "Invalid name" });
    else if (!isEmailAddressValid(emailAddress))
      return response.status(422).json({ message: "Invalid email address" });
    else if (!isPasswordValid(password))
      return response.status(422).json({ message: "Invalid password" });
    else if (!isPasswordValid(confirmPassword) && confirmPassword !== password)
      return response
        .status(422)
        .json({ message: "Confirm password does not match with password" });
  } else if (request.path === "/api/user/authenticate") {
    const { emailAddress, password } = request.body;

    if (![emailAddress, password].every(Boolean))
      return response.status(422).json({ message: "Missing credentials" });
    else if (!isEmailAddressValid(emailAddress))
      return response.status(422).json({ message: "Invalid email address" });
    else if (!isPasswordValid(password))
      return response.status(422).json({ message: "Invalid password" });
  } else if (request.path === "/api/user/update") {
    const { name, emailAddress, password, confirmPassword } = request.body;

    if (!isNameValid(name))
      return response.status(422).json({ message: "Invalid name" });
    else if (!isEmailAddressValid(emailAddress))
      return response.status(422).json({ message: "Invalid email address" });
    else if (!isPasswordValid(password))
      return response.status(422).json({ message: "Invalid password" });
    else if (!isPasswordValid(confirmPassword) && confirmPassword !== password)
      return response
        .status(422)
        .json({ message: "Confirm password does not match with password" });
  } else if (request.path === "/api/user/reset-password") {
    const { emailAddress, password, confirmPassword } = request.body;

    if (![emailAddress, password, confirmPassword].every(Boolean))
      return response.status(422).json({ message: "Missing credentials" });
    else if (!isEmailAddressValid(emailAddress))
      return response.status(422).json({ message: "Invalid email address" });
    else if (!isPasswordValid(password))
      return response.status(422).json({ message: "Invalid password" });
    else if (!isPasswordValid(confirmPassword) && confirmPassword !== password)
      return response
        .status(422)
        .json({ message: "Confirm password does not match with password" });
  }

  next();
};
