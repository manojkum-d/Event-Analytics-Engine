import {
  Model,
  ModelStatic,
  FindOptions,
  CreateOptions,
  UpdateOptions,
  DestroyOptions,
  CountOptions,
} from 'sequelize';
import CustomError from '../../shared/utils/customError/index.js';

export type QueryOptions<T extends Model> = Omit<FindOptions<any>, 'where'> & {
  where?: Partial<T>;
};

class DatabaseService {
  /**
   * Find a record by primary key
   */
  static async findById<T extends Model>(
    model: ModelStatic<T>,
    id: string,
    options?: Omit<FindOptions<any>, 'where'>
  ): Promise<T | null> {
    try {
      return await model.findByPk(id, options);
    } catch (error) {
      console.error(`Error finding record by ID in ${model.name}:`, error);
      throw new CustomError(`Failed to find record by ID in ${model.name}`, 500);
    }
  }

  /**
   * Find a single record matching the conditions
   */
  static async findOne<T extends Model>(
    model: ModelStatic<T>,
    options?: FindOptions<any>
  ): Promise<T | null> {
    try {
      return await model.findOne(options);
    } catch (error) {
      console.error(`Error finding record in ${model.name}:`, error);
      throw new CustomError(`Failed to find record in ${model.name}`, 500);
    }
  }

  /**
   * Find all records matching the conditions
   */
  static async findAll<T extends Model>(
    model: ModelStatic<T>,
    options?: FindOptions<any>
  ): Promise<T[]> {
    try {
      return await model.findAll(options);
    } catch (error) {
      console.error(`Error finding records in ${model.name}:`, error);
      throw new CustomError(`Failed to find records in ${model.name}`, 500);
    }
  }

  /**
   * Count records matching the conditions
   */
  static async count<T extends Model>(
    model: ModelStatic<T>,
    options?: CountOptions<any>
  ): Promise<number> {
    try {
      return await model.count(options);
    } catch (error) {
      console.error(`Error counting records in ${model.name}:`, error);
      throw new CustomError(`Failed to count records in ${model.name}`, 500);
    }
  }

  /**
   * Create a new record
   */
  static async create<T extends Model>(
    model: ModelStatic<T>,
    data: Partial<T>,
    options?: CreateOptions<any>
  ): Promise<T> {
    try {
      return await model.create(data as any, options);
    } catch (error) {
      console.error(`Error creating record in ${model.name}:`, error);
      throw new CustomError(`Failed to create record in ${model.name}`, 500);
    }
  }

  /**
   * Update records matching the conditions
   */
  static async update<T extends Model>(
    model: ModelStatic<T>,
    data: Partial<T>,
    options: UpdateOptions<any>
  ): Promise<number> {
    try {
      const [affectedRows] = await model.update(data as any, options);
      return affectedRows;
    } catch (error) {
      console.error(`Error updating records in ${model.name}:`, error);
      throw new CustomError(`Failed to update records in ${model.name}`, 500);
    }
  }

  /**
   * Delete records matching the conditions
   */
  static async destroy<T extends Model>(
    model: ModelStatic<T>,
    options: DestroyOptions<any>
  ): Promise<number> {
    try {
      return await model.destroy(options);
    } catch (error) {
      console.error(`Error deleting records in ${model.name}:`, error);
      throw new CustomError(`Failed to delete records in ${model.name}`, 500);
    }
  }

  /**
   * Execute a transaction
   */
  static async transaction<T>(callback: () => Promise<T>): Promise<T> {
    try {
      return await callback();
    } catch (error) {
      console.error('Error in transaction:', error);
      throw new CustomError('Transaction failed', 500);
    }
  }
}

export default DatabaseService;
