// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { AttendanceBook } = initSchema(schema);

export {
  AttendanceBook
};