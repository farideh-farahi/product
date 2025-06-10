import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

export class Order extends Model<
  InferAttributes<Order>,
  InferCreationAttributes<Order>
> {
  declare id: CreationOptional<string>; // UUID
  declare orderId: string;
  declare userId: number;
  declare productId: number;
  declare quantity: number;
  declare totalAmount: number;

  static associate(models: any) {
    this.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
    this.belongsTo(models.Product, {
      foreignKey: "productId",
      onDelete: "CASCADE",
    });
  }

  static initModel(sequelize: Sequelize): typeof Order {
    Order.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        orderId: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        productId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        totalAmount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        modelName: "Order",
        timestamps: true,
      }
    );

    return Order;
  }
}
