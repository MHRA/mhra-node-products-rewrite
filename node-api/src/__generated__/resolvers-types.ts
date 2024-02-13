import { GraphQLResolveInfo } from 'graphql';
import { MedicinesContext } from '../index';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export class Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export class Document {
  __typename?: 'Document';
  activeSubstances?: Maybe<Array<Scalars['String']>>;
  created?: Maybe<Scalars['String']>;
  docType?: Maybe<DocumentType>;
  fileSizeInBytes?: Maybe<Scalars['Int']>;
  highlights?: Maybe<Array<Scalars['String']>>;
  name?: Maybe<Scalars['String']>;
  productName?: Maybe<Scalars['String']>;
  territoryType?: Maybe<TerritoryType>;
  title?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

export class DocumentEdge {
  __typename?: 'DocumentEdge';
  cursor: Scalars['String'];
  node: Document;
};

export enum DocumentType {
  Par = 'PAR',
  Pil = 'PIL',
  Spc = 'SPC'
}

export class Documents {
  __typename?: 'Documents';
  edges: Array<DocumentEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export class MedicineLevelsInPregnancy {
  __typename?: 'MedicineLevelsInPregnancy';
  reports: Reports;
  substance: SubstanceReports;
  substancesIndex: Array<SubstanceIndex>;
};


export class MedicineLevelsInPregnancyReportsArgs {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  skip?: InputMaybe<Scalars['Int']>;
};


export class MedicineLevelsInPregnancySubstanceArgs {
  name?: InputMaybe<Scalars['String']>;
};


export class MedicineLevelsInPregnancySubstancesIndexArgs {
  letter: Scalars['String'];
};

export class PageInfo {
  __typename?: 'PageInfo';
  endCursor: Scalars['String'];
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor: Scalars['String'];
};

export class Product {
  __typename?: 'Product';
  documents: Documents;
  name: Scalars['String'];
};


export class ProductDocumentsArgs {
  documentTypes?: InputMaybe<Array<DocumentType>>;
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  territoryTypes?: InputMaybe<Array<TerritoryType>>;
};

export class ProductIndex {
  __typename?: 'ProductIndex';
  count: Scalars['Int'];
  name: Scalars['String'];
};

export class Products {
  __typename?: 'Products';
  documents: Documents;
  product: Product;
  productsIndex: Array<ProductIndex>;
  substance: Substance;
  substancesIndex: Array<SubstanceIndex>;
};


export class ProductsDocumentsArgs {
  after?: InputMaybe<Scalars['String']>;
  documentTypes?: InputMaybe<Array<DocumentType>>;
  first?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  skip?: InputMaybe<Scalars['Int']>;
  territoryTypes?: InputMaybe<Array<TerritoryType>>;
};


export class ProductsProductArgs {
  name: Scalars['String'];
};


export class ProductsProductsIndexArgs {
  substance?: InputMaybe<Scalars['String']>;
};


export class ProductsSubstanceArgs {
  name?: InputMaybe<Scalars['String']>;
};


export class ProductsSubstancesIndexArgs {
  letter: Scalars['String'];
};

export class QueryRoot {
  __typename?: 'QueryRoot';
  /** @deprecated Please use `products::documents` instead */
  documents: Documents;
  medicineLevelsInPregnancy: MedicineLevelsInPregnancy;
  /** @deprecated Please use `products::product` instead */
  product: Product;
  products: Products;
  /** @deprecated Please use `products::products_index` instead */
  productsIndex: Array<ProductIndex>;
  /** @deprecated Please use `products::substance` instead */
  substance: Substance;
  /** @deprecated Please use `products::substances_index` instead */
  substancesIndex: Array<SubstanceIndex>;
};


export class QueryRootDocumentsArgs {
  after?: InputMaybe<Scalars['String']>;
  documentTypes?: InputMaybe<Array<DocumentType>>;
  first?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  skip?: InputMaybe<Scalars['Int']>;
  territoryTypes?: InputMaybe<Array<TerritoryType>>;
};


export class QueryRootProductArgs {
  name: Scalars['String'];
};


export class QueryRootProductsIndexArgs {
  substance: Scalars['String'];
};


export class QueryRootSubstanceArgs {
  name?: InputMaybe<Scalars['String']>;
};


export class QueryRootSubstancesIndexArgs {
  letter: Scalars['String'];
};

export class Report {
  __typename?: 'Report';
  activeSubstances?: Maybe<Array<Scalars['String']>>;
  fileName?: Maybe<Scalars['String']>;
  fileSizeInBytes?: Maybe<Scalars['Int']>;
  fileUrl?: Maybe<Scalars['String']>;
  highlights?: Maybe<Array<Scalars['String']>>;
  matrices?: Maybe<Array<Scalars['String']>>;
  pbpkModels?: Maybe<Array<Scalars['String']>>;
  plNumbers?: Maybe<Array<Scalars['String']>>;
  pregnancyTrimesters?: Maybe<Array<Scalars['String']>>;
  products?: Maybe<Array<Scalars['String']>>;
  summary?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export class ReportEdge {
  __typename?: 'ReportEdge';
  cursor: Scalars['String'];
  node: Report;
};

export class Reports {
  __typename?: 'Reports';
  edges: Array<ReportEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export class Substance {
  __typename?: 'Substance';
  name: Scalars['String'];
  products: Array<Product>;
};

export class SubstanceIndex {
  __typename?: 'SubstanceIndex';
  count: Scalars['Int'];
  name: Scalars['String'];
};

export class SubstanceReports {
  __typename?: 'SubstanceReports';
  name: Scalars['String'];
  reports: Reports;
};


export class SubstanceReportsReportsArgs {
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};

export enum TerritoryType {
  Gb = 'GB',
  Ni = 'NI',
  Uk = 'UK'
}

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Document: ResolverTypeWrapper<Document>;
  DocumentEdge: ResolverTypeWrapper<DocumentEdge>;
  DocumentType: DocumentType;
  Documents: ResolverTypeWrapper<Documents>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  MedicineLevelsInPregnancy: ResolverTypeWrapper<MedicineLevelsInPregnancy>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Product: ResolverTypeWrapper<Product>;
  ProductIndex: ResolverTypeWrapper<ProductIndex>;
  Products: ResolverTypeWrapper<Products>;
  QueryRoot: ResolverTypeWrapper<{}>;
  Report: ResolverTypeWrapper<Report>;
  ReportEdge: ResolverTypeWrapper<ReportEdge>;
  Reports: ResolverTypeWrapper<Reports>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Substance: ResolverTypeWrapper<Substance>;
  SubstanceIndex: ResolverTypeWrapper<SubstanceIndex>;
  SubstanceReports: ResolverTypeWrapper<SubstanceReports>;
  TerritoryType: TerritoryType;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean'];
  Document: Document;
  DocumentEdge: DocumentEdge;
  Documents: Documents;
  Int: Scalars['Int'];
  MedicineLevelsInPregnancy: MedicineLevelsInPregnancy;
  PageInfo: PageInfo;
  Product: Product;
  ProductIndex: ProductIndex;
  Products: Products;
  QueryRoot: {};
  Report: Report;
  ReportEdge: ReportEdge;
  Reports: Reports;
  String: Scalars['String'];
  Substance: Substance;
  SubstanceIndex: SubstanceIndex;
  SubstanceReports: SubstanceReports;
}>;

export type IfdefDirectiveArgs = { };

export type IfdefDirectiveResolver<Result, Parent, ContextType = MedicinesContext, Args = IfdefDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type DocumentResolvers<ContextType = MedicinesContext, ParentType extends ResolversParentTypes['Document'] = ResolversParentTypes['Document']> = ResolversObject<{
  activeSubstances?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  docType?: Resolver<Maybe<ResolversTypes['DocumentType']>, ParentType, ContextType>;
  fileSizeInBytes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  highlights?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  productName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  territoryType?: Resolver<Maybe<ResolversTypes['TerritoryType']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DocumentEdgeResolvers<ContextType = MedicinesContext, ParentType extends ResolversParentTypes['DocumentEdge'] = ResolversParentTypes['DocumentEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Document'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DocumentsResolvers<ContextType = MedicinesContext, ParentType extends ResolversParentTypes['Documents'] = ResolversParentTypes['Documents']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['DocumentEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MedicineLevelsInPregnancyResolvers<ContextType = MedicinesContext, ParentType extends ResolversParentTypes['MedicineLevelsInPregnancy'] = ResolversParentTypes['MedicineLevelsInPregnancy']> = ResolversObject<{
  reports?: Resolver<ResolversTypes['Reports'], ParentType, ContextType, Partial<MedicineLevelsInPregnancyReportsArgs>>;
  substance?: Resolver<ResolversTypes['SubstanceReports'], ParentType, ContextType, Partial<MedicineLevelsInPregnancySubstanceArgs>>;
  substancesIndex?: Resolver<Array<ResolversTypes['SubstanceIndex']>, ParentType, ContextType, RequireFields<MedicineLevelsInPregnancySubstancesIndexArgs, 'letter'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PageInfoResolvers<ContextType = MedicinesContext, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = ResolversObject<{
  endCursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProductResolvers<ContextType = MedicinesContext, ParentType extends ResolversParentTypes['Product'] = ResolversParentTypes['Product']> = ResolversObject<{
  documents?: Resolver<ResolversTypes['Documents'], ParentType, ContextType, Partial<ProductDocumentsArgs>>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProductIndexResolvers<ContextType = MedicinesContext, ParentType extends ResolversParentTypes['ProductIndex'] = ResolversParentTypes['ProductIndex']> = ResolversObject<{
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProductsResolvers<ContextType = MedicinesContext, ParentType extends ResolversParentTypes['Products'] = ResolversParentTypes['Products']> = ResolversObject<{
  documents?: Resolver<ResolversTypes['Documents'], ParentType, ContextType, Partial<ProductsDocumentsArgs>>;
  product?: Resolver<ResolversTypes['Product'], ParentType, ContextType, RequireFields<ProductsProductArgs, 'name'>>;
  productsIndex?: Resolver<Array<ResolversTypes['ProductIndex']>, ParentType, ContextType, Partial<ProductsProductsIndexArgs>>;
  substance?: Resolver<ResolversTypes['Substance'], ParentType, ContextType, Partial<ProductsSubstanceArgs>>;
  substancesIndex?: Resolver<Array<ResolversTypes['SubstanceIndex']>, ParentType, ContextType, RequireFields<ProductsSubstancesIndexArgs, 'letter'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryRootResolvers<ContextType = MedicinesContext, ParentType extends ResolversParentTypes['QueryRoot'] = ResolversParentTypes['QueryRoot']> = ResolversObject<{
  documents?: Resolver<ResolversTypes['Documents'], ParentType, ContextType, Partial<QueryRootDocumentsArgs>>;
  medicineLevelsInPregnancy?: Resolver<ResolversTypes['MedicineLevelsInPregnancy'], ParentType, ContextType>;
  product?: Resolver<ResolversTypes['Product'], ParentType, ContextType, RequireFields<QueryRootProductArgs, 'name'>>;
  products?: Resolver<ResolversTypes['Products'], ParentType, ContextType>;
  productsIndex?: Resolver<Array<ResolversTypes['ProductIndex']>, ParentType, ContextType, RequireFields<QueryRootProductsIndexArgs, 'substance'>>;
  substance?: Resolver<ResolversTypes['Substance'], ParentType, ContextType, Partial<QueryRootSubstanceArgs>>;
  substancesIndex?: Resolver<Array<ResolversTypes['SubstanceIndex']>, ParentType, ContextType, RequireFields<QueryRootSubstancesIndexArgs, 'letter'>>;
}>;

export type ReportResolvers<ContextType = MedicinesContext, ParentType extends ResolversParentTypes['Report'] = ResolversParentTypes['Report']> = ResolversObject<{
  activeSubstances?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  fileName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fileSizeInBytes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fileUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  highlights?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  matrices?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  pbpkModels?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  plNumbers?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  pregnancyTrimesters?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  products?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  summary?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ReportEdgeResolvers<ContextType = MedicinesContext, ParentType extends ResolversParentTypes['ReportEdge'] = ResolversParentTypes['ReportEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Report'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ReportsResolvers<ContextType = MedicinesContext, ParentType extends ResolversParentTypes['Reports'] = ResolversParentTypes['Reports']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['ReportEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubstanceResolvers<ContextType = MedicinesContext, ParentType extends ResolversParentTypes['Substance'] = ResolversParentTypes['Substance']> = ResolversObject<{
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  products?: Resolver<Array<ResolversTypes['Product']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubstanceIndexResolvers<ContextType = MedicinesContext, ParentType extends ResolversParentTypes['SubstanceIndex'] = ResolversParentTypes['SubstanceIndex']> = ResolversObject<{
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubstanceReportsResolvers<ContextType = MedicinesContext, ParentType extends ResolversParentTypes['SubstanceReports'] = ResolversParentTypes['SubstanceReports']> = ResolversObject<{
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  reports?: Resolver<ResolversTypes['Reports'], ParentType, ContextType, Partial<SubstanceReportsReportsArgs>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = MedicinesContext> = ResolversObject<{
  Document?: DocumentResolvers<ContextType>;
  DocumentEdge?: DocumentEdgeResolvers<ContextType>;
  Documents?: DocumentsResolvers<ContextType>;
  MedicineLevelsInPregnancy?: MedicineLevelsInPregnancyResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Product?: ProductResolvers<ContextType>;
  ProductIndex?: ProductIndexResolvers<ContextType>;
  Products?: ProductsResolvers<ContextType>;
  QueryRoot?: QueryRootResolvers<ContextType>;
  Report?: ReportResolvers<ContextType>;
  ReportEdge?: ReportEdgeResolvers<ContextType>;
  Reports?: ReportsResolvers<ContextType>;
  Substance?: SubstanceResolvers<ContextType>;
  SubstanceIndex?: SubstanceIndexResolvers<ContextType>;
  SubstanceReports?: SubstanceReportsResolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = MedicinesContext> = ResolversObject<{
  ifdef?: IfdefDirectiveResolver<any, any, ContextType>;
}>;
