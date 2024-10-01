import {
  addressInterface,
  customerInterface,
} from '../../types/database/db.types';
import { AddressModel, CustomerModel } from '../models';

class CustomerRepository {
  async CreateCustomer({ email, password, phone, salt }: customerInterface) {
    const customer = new CustomerModel({
      email,
      password,
      salt,
      phone,
      address: [],
    });

    const customerResult = await customer.save();
    return customerResult;
  }

  async CreateAddress(
    _id: string,
    { street, postalCode, city, country }: addressInterface,
  ) {
    const profile = await CustomerModel.findById(_id);

    if (profile) {
      const newAddress = new AddressModel({
        street,
        postalCode,
        city,
        country,
      });

      await newAddress.save();

      profile.address.push(newAddress._id);
      return await profile.save();
    }
  }

  async FindCustomer(email: string) {
    const existingCustomer = await CustomerModel.findOne({ email: email });
    return existingCustomer;
  }

  async FindCustomerById(id: string) {
    try{
      const existingCustomer = await CustomerModel.findById(id).populate(
        'address',
      );
      return existingCustomer;
    }catch(err){
      throw(err);
    }
  }

  async DeleteCustomerById(id: string) {
    return CustomerModel.findByIdAndDelete(id);
  }
}

export default CustomerRepository;
