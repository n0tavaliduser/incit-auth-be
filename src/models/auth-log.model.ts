import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';

export interface AuthLogAttributes {
  id: number;
  user_id: number;
  action: 'login' | 'logout';
  created_at: Date;
}

// Export the creation attributes interface
export type AuthLogCreationAttributes = Optional<AuthLogAttributes, 'id' | 'created_at'>;

export class AuthLog extends Model<AuthLogAttributes, AuthLogCreationAttributes> {
  public id!: number;
  public user_id!: number;
  public action!: 'login' | 'logout';
  public created_at!: Date;
}

AuthLog.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    action: {
      type: DataTypes.ENUM('login', 'logout'),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'auth_logs',
    timestamps: false,
  }
);

// Define association
AuthLog.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(AuthLog, { foreignKey: 'user_id' });

export default AuthLog; 