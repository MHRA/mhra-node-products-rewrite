import { SubstancesDataSource } from '../dist/shared/substances_index.js';
import { expect } from 'chai';
import { FacetResults } from '../dist/types.js';

describe('SubstancesDataSource', () => {
  let substancesDataSource;

  beforeEach(() => {
    substancesDataSource = new SubstancesDataSource();
  });

  /**
   * Test suite for the get_substances_index method.
   */
  describe('get_substances_index', () => {
    //Check that the substance index for each letter is valid
    it('should return substance index results', function()  {
      this.timeout = 5000;
      const letter = 'A';

      substancesDataSource.get_substances_index(letter).then(response => {
        
        expect(response).to.contain.any();
        response.forEach(substance => {
          expect(substance.name.startsWith('A')).to.be.true;
        });

      });
    });
  });

  /**
   * Test suite for the get_substance_with_products method.
   */
  describe('get_substance_with_products', () => {
    //Check that we get can get the products that are associated to a substance
    it('should return substance details with associated products', function() {
      this.timeout = 5000;

      const substance_name = 'TEST';
      substancesDataSource.get_substance_with_products(substance_name).then(response => {
        expect(response.name).to.equal(substance_name);
        expect(response.products).to.contain.any();
      });
    });
  });
});