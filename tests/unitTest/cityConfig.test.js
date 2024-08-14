// cityCodes.test.js
import { expect } from 'chai';
import { cityCodeToNameMap, cityNameToCodeMap } from '../../src/infrastructure/configs/cityConfigs.js';

describe('City Codes', () => {
    it('should have correct mapping for cityCodeToNameMap', () => {
        expect(cityCodeToNameMap).to.have.property('A', '臺北市');
        expect(cityCodeToNameMap).to.have.property('F', '新北市');
        expect(cityCodeToNameMap).to.have.property('J', '新竹縣');
        // Add more tests as needed
    });

    it('should have correct mapping for cityNameToCodeMap', () => {
        expect(cityNameToCodeMap).to.have.property('臺北市', 'A');
        expect(cityNameToCodeMap).to.have.property('新北市', 'F');
        expect(cityNameToCodeMap).to.have.property('新竹縣', 'J');
        // Add more tests as needed
    });

    it('cityCodeToNameMap and cityNameToCodeMap should be consistent', () => {
        Object.keys(cityCodeToNameMap).forEach(key => {
            const city = cityCodeToNameMap[key];
            expect(cityNameToCodeMap).to.have.property(city, key);
        });
    });
});
