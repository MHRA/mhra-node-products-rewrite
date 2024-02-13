import { expect } from 'chai';
import { ProductsDataSource } from '../dist/query_objects/products/products_index.js';
import { DocumentType, TerritoryType } from '../dist/__generated__/resolvers-types.js';

describe('ProductsDataSource', () => {
  let dataSource;

  beforeEach(() => {
    dataSource = new ProductsDataSource();
  });

  /*
   * Test suite for the get_products_index method.
  */
    describe('get_products_associated_with_substances', () => {
        //Check we get can get a list of products against a given substance    
        it('should retrieve products associated with a given substance', function () {
                const substance = 'TEST';
                this.timeout = 5000;
                dataSource.get_products_associated_with_substances(substance).then(response => {
                    expect(response).to.contain.any();
                });
        });
    });

  /*
   * Test suite for the filter_products_by_name method.
  */
    describe('filter_products_by_name', () => {
        it('filters products by name and return the corresponding product details', function () {
                const product = 'ABIRATERONE';
                this.timeout = 5000;
                dataSource.filter_products_by_name(product).then(response => {
                    expect(response).to.contain.any();
                    expect(response.name).to.equal(product);
                    expect(response.documents.totalCount).to.contain.any();
                });
        });
    });


  /*
   * Test suite for the search_product_documents method.
  */
     describe('search_product_documents', () => {
        it('searches for product documents based on the given parameters', function () {
                const search_term = 'MEDICINE';
                this.timeout = 5000;
                dataSource.search_product_documents(search_term).then(response => {
                    expect(response).to.contain.any();
                });
        });
    });

    /* 
    Test suite for mapping types 
    */
    describe('mapping_type_methods', () => {
        it('spc document type should return DocumentType.Spc', function () {
            const type = 'spc';
            const result = dataSource.map_string_to_document_type(type);
            expect(result).to.equal(DocumentType.Spc);
        });
        it('pil document type should return DocumentType.Pil', function () {
            const type = 'pil';
            const result = dataSource.map_string_to_document_type(type);
            expect(result).to.equal(DocumentType.Pil);
        });

        it('par document type should return DocumentType.Par', function () {
            const type = 'par';
            const result = dataSource.map_string_to_document_type(type);
            expect(result).to.equal(DocumentType.Par);
        });

        it('UK territory type should return TerritoryType.UK', function () {
            const type = 'uk';
            const result = dataSource.map_string_to_territory_type(type);
            expect(result).to.equal(TerritoryType.Uk);
        });
        it('NI territory type should return TerritoryType.NI', function () {
            const type = 'ni';
            const result = dataSource.map_string_to_territory_type(type);
            expect(result).to.equal(TerritoryType.Ni);
        });

        it('GB territory type should return TerritoryType.GB', function () {
            const type = 'gb';
            const result = dataSource.map_string_to_territory_type(type);
            expect(result).to.equal(TerritoryType.Gb);
        });
    });

    /*
    build_document_types_filter method test suite
    */
    describe('build_document_types_filter', () => {
        it('returns null when documentTypes is empty', () => {
          const document_type = [];
          const result = dataSource.build_document_types_filter(document_type);
          expect(result).to.equal(null);
        });
      
        it('returns the correct filter string when documentTypes has one element', () => {
          const document_type = [DocumentType.Spc];
          const result = dataSource.build_document_types_filter(document_type);
          expect(result).to.equal("(doc_type eq 'SPC')");
        });
      
        it('returns the correct filter string when documentTypes has multiple elements', () => {
          const document_types = [DocumentType.Spc, DocumentType.Pil];
          const result = dataSource.build_document_types_filter(document_types);
          expect(result).to.equal("(doc_type eq 'SPC' or doc_type eq 'PIL')");
        });
      });

    /*
    build_product_name_filter method test suite
    */
      describe('build_product_name_filter', () => {
        it('returns the correct filter string', () => {
          const product_name = 'Test Product';
          const expected_filter = "(product_name eq 'Test Product')";
          const filter = dataSource.build_product_name_filter(product_name);
          expect(filter).to.equal(expected_filter);
        });
      });
});