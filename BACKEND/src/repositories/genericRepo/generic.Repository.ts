import { Model, Document, SortOrder, PopulateOptions, PipelineStage, Query } from 'mongoose'

// Type alias for populate argument (can be single, multiple, or string array)
type PopulateArg = PopulateOptions | PopulateOptions[] | string[]

// Generic Repository Interface
export interface IGenericRepository<T extends Document> {
  // Create single or multiple documents
  create(payload: Partial<T>): Promise<T>
  create(payload: Partial<T>[]): Promise<T[]>

  // Find one document with optional population
  findOne(filter: object, populate?: PopulateArg): Promise<T | null>

  // Find by document ID
  findById(id: string): Promise<T | null>

  // Find all documents with optional filter, population, and sorting
  findAll(
    filter?: object,
    populate?: PopulateArg,
    sort?: Record<string, SortOrder>,
  ): Promise<T[] | null>

  // Update by ID
  update(id: string, data: Partial<T>): Promise<T | null>

  // Update first document matching filter
  updateOne(filter: object, data: Partial<T>): Promise<T | null>

  // Delete by ID
  delete(id: string): Promise<T | null>

  // Find by ID and populate relations if needed
  findByIdWithPopulate(id: string, populate?: PopulateArg): Promise<T | null>

  // Update first document with filter and populate if needed
  updateOneWithPopulate(
    filter: object,
    data: Partial<T> | Record<string, any>,
    populate?: PopulateArg,
  ): Promise<T | null>

  // Pagination with filter, page, limit, sort, and population
  paginate(
    filter: object,
    page: number,
    limit: number,
    sort?: Record<string, SortOrder>,
    populate?: PopulateArg,
  ): Promise<{ data: T[]; total: number }>

  // Find and update with custom options
  findOneAndUpdate(filter: object, update: object, options?: object): Promise<T | null>

  // Run aggregation pipeline
  aggregate<R = any>(pipeline: PipelineStage[]): Promise<R[]>

  // Find with filter, optional population and sorting
  find(filter: object, populate?: PopulateArg, sort?: Record<string, SortOrder>): Promise<T[]>

  // Return a query object (for chaining query methods outside repository)
  createQuery(filter: object): Query<T[], T>

  // Count documents based on filter
  countDocuments(filter: object): Promise<number>
}

// Generic Repository Implementation
export class GenericRepository<T extends Document> {
  protected model: Model<T>

  constructor(model: Model<T>) {
    this.model = model
  }

  // Method Overloads for create (single or multiple documents)
  async create(payload: Partial<T>): Promise<T>
  async create(payload: Partial<T>[]): Promise<T[]>
  async create(payload: Partial<T> | Partial<T>[]): Promise<T | T[]> {
    return await this.model.create(payload)
  }

  // Find single document with optional population
  async findOne(filter: object, populate?: PopulateArg): Promise<T | null> {
    let query = this.model.findOne(filter)

    if (populate) {
      query = query.populate(populate)
    }

    return await query.exec()
  }

  // Find all documents with filter, population, and sorting
  async findAll(
    filter: object = {},
    populate?: PopulateArg,
    sort: Record<string, SortOrder> = {},
  ): Promise<T[]> {
    let query = this.model.find(filter)

    if (populate) {
      query = query.populate(populate)
    }

    if (Object.keys(sort).length > 0) {
      query = query.sort(sort)
    }

    return await query
  }

  // Find by ID
  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id)
  }

  // Update by ID
  async update(id: string, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true })
  }

  // Update one document matching filter
  async updateOne(filter: object, data: Partial<T>): Promise<T | null> {
    const updatedDoc = await this.model.findOneAndUpdate(filter, data, {
      new: true,
      upsert: false,
    })

    if (!updatedDoc) {
      console.warn('No document found to update with filter:', filter)
    }

    return updatedDoc
  }

  // Delete by ID
  async delete(id: string): Promise<T | null> {
    return await this.model.findByIdAndDelete(id)
  }

  // Pagination with filter, page, limit, sorting, and population
  async paginate(
    filter: object,
    page: number,
    limit: number,
    sort: Record<string, SortOrder> = { createdAt: -1 },
    populate?: PopulateArg,
  ): Promise<{ data: T[]; total: number }> {
    const total = await this.model.countDocuments(filter)

    let query = this.model.find(filter).sort(sort)

    if (populate) {
      query = query.populate(populate)
    }

    const data = await query.skip((page - 1) * limit).limit(limit)

    return { data, total }
  }

  // Find by ID with population
  async findByIdWithPopulate(id: string, populate?: PopulateArg): Promise<T | null> {
    let query = this.model.findById(id)
    if (populate) {
      query = query.populate(populate)
    }
    return await query
  }

  // Update one document with population if needed
  async updateOneWithPopulate(
    filter: object,
    data: Partial<T> | Record<string, any>,
    populate?: PopulateArg,
  ): Promise<T | null> {
    let query = this.model.findOneAndUpdate(filter, data, {
      new: true,
      upsert: false,
    })

    if (populate) {
      query = query.populate(populate)
    }

    return await query
  }

  // Find one and update with custom options
  async findOneAndUpdate(
    filter: object,
    update: object,
    options: object = { new: true },
  ): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, update, options)
  }

  // Run aggregation pipeline
  async aggregate<R = any>(pipeline: PipelineStage[]): Promise<R[]> {
    return this.model.aggregate<R>(pipeline)
  }

  // Find documents with filter, population, and sorting
  async find(
    filter: object = {},
    populate?: PopulateArg,
    sort: Record<string, SortOrder> = {},
  ): Promise<T[]> {
    let query = this.model.find(filter)

    if (populate) {
      query = query.populate(populate)
    }

    if (Object.keys(sort).length > 0) {
      query = query.sort(sort)
    }

    return await query
  }

  // Return a query object for chaining queries externally
  createQuery(filter: object): Query<T[], T> {
    return this.model.find(filter)
  }

  // Count documents based on filter
  async countDocuments(filter: object): Promise<number> {
    return await this.model.countDocuments(filter)
  }
}
