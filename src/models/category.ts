import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

export class Category extends Model<
  InferAttributes<Category>,
  InferCreationAttributes<Category>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: string | null;
  declare is_active: boolean;

  static associate(models: any) {
    this.hasMany(models.Subcategory, {
      foreignKey: "categoryId",
      onDelete: "CASCADE",
    });
    this.hasMany(models.Product, {
      foreignKey: "categoryId",
      onDelete: "CASCADE",
    });
  }

  static initModel(sequelize: Sequelize): typeof Category {
    Category.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        description: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      {
        sequelize,
        modelName: "Category",
        timestamps: true,
      }
    );

    return Category;
  }
}
