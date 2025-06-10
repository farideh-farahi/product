import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

export class Product extends Model<
  InferAttributes<Product>,
  InferCreationAttributes<Product>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare brandId: number;
  declare price: number;
  declare cover: number | null;
  declare gallery: number | null;
  declare categoryId: number;
  declare subcategoryIds: number[] | null;
  declare status: number;
  declare inventory: number;
  declare attributes: any;

  static associate(models: any) {
    this.belongsTo(models.Brand, { foreignKey: "brandId", onDelete: "CASCADE" });
    this.belongsTo(models.FileImage, { foreignKey: "cover", as: "CoverImage", onDelete: "SET NULL" });
    this.hasMany(models.Gallery, { foreignKey: "productId", as: "Galleries", onDelete: "SET NULL" });
    this.belongsTo(models.Category, { foreignKey: "categoryId", onDelete: "CASCADE" });
    this.belongsToMany(models.Subcategory, {
      through: "ProductSubcategories",
      foreignKey: "productId",
    });
    this.hasMany(models.Order, { foreignKey: "productId", onDelete: "CASCADE" });
  }

  static initModel(sequelize: Sequelize): typeof Product {
    Product.init(
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
        brandId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        price: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        cover: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        gallery: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        categoryId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        subcategoryIds: {
          type: DataTypes.ARRAY(DataTypes.INTEGER),
          allowNull: true,
        },
        status: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        inventory: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 5,
        },
        attributes: {
          type: DataTypes.JSON,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "Product",
        timestamps: true,
      }
    );

    return Product;
  }
}
