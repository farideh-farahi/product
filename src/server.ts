import 'dotenv/config';
import app from './app';
import db from './models';

const PORT = process.env.PORT || 3000;

db.sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((err: any) => {
    console.error('❌ Database connection failed:', err);
  });
