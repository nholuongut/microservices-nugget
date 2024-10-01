interface customerInterface {
  email: string;
  password: string;
  phone: string;
  salt: string;
}

interface addressInterface {
    street: string
    postalCode: string
    country: string
    city: string
}

export { customerInterface, addressInterface };
