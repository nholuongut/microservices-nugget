import CustomerRepository from '../database/repository/customer.repositoy';
import { UserInputInterface } from '../types/user/userInputs.types';
import {
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
} from '../utils';
import { NotFoundError, ValidationError } from '../utils/errors/app-errors';

// All Business logic will be here
class CustomerService {
  repository: CustomerRepository;
  constructor() {
    this.repository = new CustomerRepository();
  }

  async SignIn(userInputs: UserInputInterface) {
    const { email, password: inputPasswd } = userInputs;

    const existingCustomer = await this.repository.FindCustomer(email);

    if (!existingCustomer)
      throw new NotFoundError('user not found with provided email id!');

    const { password, salt } = existingCustomer as unknown as {
      password: string;
      salt: string;
    };
    // console.log(existingCustomer)

    const validPassword = await ValidatePassword({
      inputPasswd,
      password,
      salt,
    });
    if (!validPassword) throw new ValidationError('password does not match!');

    const token = await GenerateSignature({
      email: existingCustomer.email,
      _id: existingCustomer._id,
    });

    return { id: existingCustomer._id, token };
  }

  async SignUp(userInputs: UserInputInterface) {
    const { email, password, phone } = userInputs;

    // create salt
    const salt = await GenerateSalt();

    const userPassword = await GeneratePassword(password, salt);

    const existingCustomer = await this.repository.CreateCustomer({
      email,
      password: userPassword,
      phone,
      salt,
    });

    const token = await GenerateSignature({
      email: email,
      _id: existingCustomer._id,
    });
    return { id: existingCustomer._id, token };
  }

  async AddNewAddress(_id: string, userInputs: UserInputInterface) {
    const { street, postalCode, city, country } = userInputs;

    return this.repository.CreateAddress(_id, {
      street,
      postalCode,
      city,
      country,
    });
  }

  async GetProfile(id: string) {
    return this.repository.FindCustomerById(id);
  }

  async DeleteProfile(userId: string) {
    const data = await this.repository.DeleteCustomerById(userId);
    const payload = {
      event: 'DELETE_PROFILE',
      data: { userId },
    };
    return { data, payload };
  }
}

export default CustomerService;
