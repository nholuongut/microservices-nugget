import request from 'supertest';
import jest from 'jest';
import { CreateServer } from '../app';

const app = CreateServer();

describe('shopping', () => {
  describe('hello test', () => {
    it('validate', () => {
      console.log('test');
    });
  });
});
