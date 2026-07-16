const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

schema = schema.replace(/provider = "postgresql"/g, 'provider = "mongodb"');
schema = schema.replace(/id\s+String\s+@id\s+@default\(uuid\(\)\)/g, 'id String @id @default(auto()) @map("_id") @db.ObjectId');

// Find all fields that end with 'Id' and are of type 'String' (but not optional 'String?')
schema = schema.replace(/(\w+Id)\s+String(\s+)(?!@id)/g, '$1 String @db.ObjectId$2');
// Find all fields that end with 'Id' and are of type 'String?'
schema = schema.replace(/(\w+Id)\s+String\?(\s+)/g, '$1 String? @db.ObjectId$2');

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Converted schema to MongoDB');
