import { expect } from 'chai';
import { MedicineLevelsInPregnancyDataSource } from '../dist/query_objects/medicine_levels_in_pregnancy/query_root.js';
import { DocumentType, TerritoryType } from '../dist/__generated__/resolvers-types.js';

describe('MedicineLevelsInPregnancyDataSource', () => {
  let dataSource;

  beforeEach(() => {
    dataSource = new MedicineLevelsInPregnancyDataSource();
  });

  /*
   * Test suite for the reports_associated_with_substance method.
  */
    describe('reports_associated_with_substance', () => {
        //Check we get can get a list of products against a given substance    
        it('should retrieve reports associated with a given substance', function () {
                const substance = 'BARICITINIB';
                this.timeout = 5000;
                dataSource.reports_associated_with_substance(substance).then(response => {
                    //console.log("response reports_associated_with_substance ", response);
                    expect(response).to.contain.any();
                });
        });
    });

  /*
   * Test suite for the reports_associated_with_substance method.
  */
    describe('get_report_count_against_substance_index', () => {
        it('should get the total number of reports against a substance letter index', function () {
                const letter = 'A';
                this.timeout = 5000;
                dataSource.get_report_count_against_substance_index(letter).then(response => {
                    console.log("response get_report_count_against_substance_index ", response);
                    expect(response).to.contain.any();
                });
        });
    });

    
});