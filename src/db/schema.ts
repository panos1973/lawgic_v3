import { relations } from 'drizzle-orm'
import {
  text,
  pgTable,
  timestamp,
  uuid,
  jsonb,
  vector,
  json,
  numeric,
  boolean,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey().unique().notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  //   done: boolean("done").default(false).notNull(),
})

export const userRelations = relations(users, ({ many }) => ({
  chats: many(chats),
}))

// Users preferences tables
export const user_lawbot_preferences = pgTable('user_lawbot_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  includeGreekLaws: boolean('include_greek_laws').default(true).notNull(),
  includeGreekCourtDecisions: boolean('include_greek_court_decisions')
    .default(false)
    .notNull(),
  includeEuropeanLaws: boolean('include_european_laws')
    .default(false)
    .notNull(),
  includeEuropeanCourtDecisions: boolean('include_european_court_decisions')
    .default(false)
    .notNull(),
  includeGreekBibliography: boolean('include_greek_bibliography')
    .default(false)
    .notNull(),
  includeForeignBibliography: boolean('include_foreign_bibliography')
    .default(false)
    .notNull(),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  updatedAt: timestamp('updated_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
})

export const user_case_research_preferences = pgTable(
  'user_case_research_preferences',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull(),
    includeGreekLaws: boolean('include_greek_laws').default(true).notNull(),
    includeGreekCourtDecisions: boolean('include_greek_court_decisions')
      .default(false)
      .notNull(),
    includeEuropeanLaws: boolean('include_european_laws')
      .default(false)
      .notNull(),
    includeEuropeanCourtDecisions: boolean('include_european_court_decisions')
      .default(false)
      .notNull(),
    includeGreekBibliography: boolean('include_greek_bibliography')
      .default(false)
      .notNull(),
    includeForeignBibliography: boolean('include_foreign_bibliography')
      .default(false)
      .notNull(),
    createdAt: timestamp('created_at', {
      precision: 6,
      withTimezone: true,
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      precision: 6,
      withTimezone: true,
    }).defaultNow(),
  }
)

export const user_contract_chat_preferences = pgTable(
  'user_contract_chat_preferences',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull(),
    includeGreekLaws: boolean('include_greek_laws').default(true).notNull(),
    includeGreekCourtDecisions: boolean('include_greek_court_decisions')
      .default(false)
      .notNull(),
    includeEuropeanLaws: boolean('include_european_laws')
      .default(false)
      .notNull(),
    includeEuropeanCourtDecisions: boolean('include_european_court_decisions')
      .default(false)
      .notNull(),
    includeGreekBibliography: boolean('include_greek_bibliography')
      .default(false)
      .notNull(),
    includeForeignBibliography: boolean('include_foreign_bibliography')
      .default(false)
      .notNull(),
    createdAt: timestamp('created_at', {
      precision: 6,
      withTimezone: true,
    }).defaultNow(),
    updatedAt: timestamp('updated_at', {
      precision: 6,
      withTimezone: true,
    }).defaultNow(),
  }
)

// Athena Chat Tables

export const chats = pgTable('chats', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  userId: text('user_id').notNull(),
  note: text('note').default(''),
})

export const chatRelations = relations(chats, ({ many }) => ({
  messages: many(messages),
  files: many(chat_files),
}))

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  role: text('roles').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  chatId: uuid('chat_id').notNull(),
})

export const chat_files = pgTable('chat_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  file_name: text('file_name').notNull(),
  file_path: text('file_path').notNull(),
  file_type: text('file_type').notNull(),
  file_size: numeric('file_size').notNull(),
  file_content: text('file_content').notNull(),
  file_blob: text('file_blob'),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  chat_id: uuid('chat_id').notNull(), // Reference to the chats table
})

export const chat_files_collection = pgTable('chat_files_collection', {
  id: uuid('uuid').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  cmetadata: json('cmetadata'),
})

export const chat_files_embedding = pgTable('chat_files_embedding', {
  id: uuid('id').defaultRandom().primaryKey(),
  embedding: vector('embedding', { dimensions: 1536 }).notNull(),
  document: text('document').notNull(),
  metadata: jsonb('metadata').notNull(),
  collection_id: uuid('collection_id').notNull(),
})

// Case Research Tables

export const case_study = pgTable('case_study', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  userId: text('user_id').notNull(),
  note: text('note').default(''),
})

export const case_study_messages = pgTable('case_study_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  content: text('content').notNull(),
  role: text('role').notNull(),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  case_study_id: uuid('case_study_id').notNull(),
})

export const caseStudyRelations = relations(case_study, ({ many }) => ({
  case_study_messages: many(case_study_messages),
  case_study_files: many(case_study_files),
}))

export const case_study_files = pgTable('case_study_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  file_name: text('file_name').notNull(),
  file_path: text('file_path').notNull(),
  file_type: text('file_type').notNull(),
  file_size: numeric('file_size').notNull(),
  file_content: text('file_content').notNull(),
  file_blob: text('file_blob'),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  case_study_id: uuid('case_study_id').notNull(),
})

export const case_files_collection = pgTable('case_files_collection', {
  id: uuid('uuid').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  cmetadata: json('cmetadata'),
})

export const case_files_embedding = pgTable('case_files_embedding', {
  id: uuid('id').defaultRandom().primaryKey(),
  embedding: vector('embedding', { dimensions: 1536 }).notNull(),
  document: text('document').notNull(),
  metadata: jsonb('metadata').notNull(),
  collection_id: uuid('collection_id').notNull(),
})

// Contracts Tables

export const contract = pgTable('contract', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  userId: text('user_id').notNull(),
  note: text('note').default(''),
})

export const contract_sections = pgTable('contract_sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  contractId: text('contract_id').notNull(),
})

export const contract_data_fields = pgTable('contract_data_fields', {
  id: uuid('id').defaultRandom().primaryKey(),
  field_name: text('field_name').notNull(),
  field_type: text('field_type').notNull(),
  value: text('value'),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  contractId: text('contract_id').notNull(),
})

export const contract_drafts = pgTable('contract_drafts', {
  id: uuid('id').defaultRandom().primaryKey(),
  draft: text('title').notNull(),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  contractId: text('contract_id').notNull(),
  //   contractSectionIds: text("contract_section_ids").array().notNull(),
})

export const contractAndSectionRelations = relations(contract, ({ many }) => ({
  contract_sections: many(contract_sections),
  contract_data_fields: many(contract_data_fields),
}))

// export const contractSectionAndDraftsRelations = relations(
//   contract_sections,
//   ({ many }) => ({
//     contract_sections_drafts: many(contract_sections_drafts),
//   })
// );

// export const contract_draft = pgTable("contract_draft", {
//   id: uuid("id").defaultRandom().primaryKey(),
//   title: text("title").notNull(),
//   createdAt: timestamp("created_at", {
//     precision: 6,
//     withTimezone: true,
//   }).defaultNow(),
//   userId: text("user_id").notNull(),
// });

// export const contract_chat_messages = pgTable("contract_chat_messages", {
//   id: uuid("id").defaultRandom().primaryKey(),
//   content: text("content").notNull(),
//   role: text("role").notNull(),
//   createdAt: timestamp("created_at", {
//     precision: 6,
//     withTimezone: true,
//   }).defaultNow(),
//   contract_chat_id: uuid("contract_chat_id").notNull(),
// });

// export const contract_draft_messages = pgTable("contract_draft_messages", {
//   id: uuid("id").defaultRandom().primaryKey(),
//   content: text("content").notNull(),
//   role: text("role").notNull(),
//   createdAt: timestamp("created_at", {
//     precision: 6,
//     withTimezone: true,
//   }).defaultNow(),
//   case_study_id: uuid("case_study_id").notNull(),
// });

// export const contract_draft_files = pgTable("contract_draft_files", {
//   id: uuid("id").defaultRandom().primaryKey(),
//   file_name: text("file_name").notNull(),
//   file_path: text("file_path").notNull(),
//   file_type: text("file_type").notNull(),
//   file_size: numeric("file_size").notNull(),
//   file_content: text("file_content").notNull(),
//   createdAt: timestamp("created_at", {
//     precision: 6,
//     withTimezone: true,
//   }).defaultNow(),
//   contract_draft_id: uuid("contract_draft_id").notNull(),
// });

// export const contractChatRelations = relations(contract_chat, ({ many }) => ({
//   contract_chat_messages: many(contract_chat_messages),
//   contract_chat_files: many(contract_chat_files),
// }));

// export const contractDraftRelations = relations(contract_draft, ({ many }) => ({
//   contract_draft_messages: many(contract_draft_messages),
//   contract_draft_files: many(contract_draft_files),
// }));

export const contract_files = pgTable('contract_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  file_name: text('file_name').notNull(),
  file_path: text('file_path').notNull(),
  file_type: text('file_type').notNull(),
  file_size: numeric('file_size').notNull(),
  file_content: text('file_content').notNull(),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  contract_id: uuid('contract_id').notNull(),
})

// Standard Contracts Tables

export const standard_contract = pgTable('standard_contract', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  userId: text('user_id').notNull(),
  note: text('note').default(''),
})

export const standard_contract_sections = pgTable(
  'standard_contract_sections',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at', {
      precision: 6,
      withTimezone: true,
    }).defaultNow(),
    standardContractId: text('standard_contract_id').notNull(),
  }
)

export const standard_contract_data_fields = pgTable(
  'standard_contract_data_fields',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    field_name: text('field_name').notNull(),
    field_type: text('field_type').notNull(),
    value: text('value'),
    createdAt: timestamp('created_at', {
      precision: 6,
      withTimezone: true,
    }).defaultNow(),
    standardContractId: text('standard_contract_id').notNull(),
  }
)

export const standard_contract_drafts = pgTable('standard_contract_drafts', {
  id: uuid('id').defaultRandom().primaryKey(),
  draft: text('title').notNull(),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  standardContractId: text('standard_contract_id').notNull(),
})

export const standard_contract_files = pgTable('standard_contract_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  file_name: text('file_name').notNull(),
  file_path: text('file_path').notNull(),
  file_type: text('file_type').notNull(),
  file_size: numeric('file_size').notNull(),
  file_content: text('file_content').notNull(),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
  }).defaultNow(),
  standardContractId: uuid('standard_contract_id').notNull(),
})

// Relations for standard contracts
export const standardContractAndSectionRelations = relations(
  standard_contract,
  ({ many }) => ({
    standard_contract_sections: many(standard_contract_sections),
    standard_contract_data_fields: many(standard_contract_data_fields),
  })
)
