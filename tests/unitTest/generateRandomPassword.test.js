import { expect } from 'chai';
import randomStringGenerator from '../../src/utils/RandomStringGenerator.js';

describe('generateRandomPassword', function () {
  it('should generate a password of specified length', function () {
    const password = randomStringGenerator.generate(10);
    expect(password).to.have.lengthOf(10);
  });

  it('should generate a password with default mode and length', function () {
    const password = randomStringGenerator.generate();
    expect(password).to.have.lengthOf(10);
  });

  
  it('should generate a password with number complexity', function () {
    const password = randomStringGenerator.generate(10, 'number');
    expect(password).to.have.lengthOf(10);
    expect(password).to.match(/^[0-9]+$/); // only lowercase and numbers
  });


  it('should generate a password with low complexity', function () {
    const password = randomStringGenerator.generate(10, 'low');
    expect(password).to.have.lengthOf(10);
    expect(password).to.match(/^[a-z0-9]+$/); // only lowercase and numbers
  });

  it('should generate a password with medium complexity', function () {
    const password = randomStringGenerator.generate(10, 'medium');
    expect(password).to.have.lengthOf(10);
    expect(password).to.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[A-Za-z0-9]+$/); // lowercase, uppercase, and numbers
  });

  it('should generate a password with high complexity', function () {
    const password = randomStringGenerator.generate(10, 'high');
    expect(password).to.have.lengthOf(10);
    expect(password).to.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@\-_=<>* /|#*%+&^$~`()[\]{}.,])[A-Za-z0-9!@\-_=<>* /|#*%+&^$~`()[\]{}.,]+$/); // lowercase, uppercase, numbers, special characters
  });

  it('should throw an error for invalid mode', function () {
    expect(() => randomStringGenerator.generate(10, 'invalid')).to.throw('Invalid mode');
  });

  it('should throw an error for negative length', function () {
    expect(() => randomStringGenerator.generate(-1)).to.throw('Length must be a positive number');
  });
});