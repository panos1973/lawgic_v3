export type Chat = {
  id: string
  userId: string
  title: string
  note: string | null
  createdAt: Date | null
}

export type CaseStudy = {
  id: string
  userId: string
  title: string
  note: string | null
  createdAt: Date | null
}

export type Contract = {
  id: string
  userId: string
  title: string
  note: string | null
  description?: string | null
  createdAt: Date | null
}

export type CaseStudyFile = {
  id: string
  case_study_id: string
  file_name: string
  file_path: string
  file_size: string
  file_type: string
  file_content: string
  file_blob: string
}

export type ContractFile = {
  id: string
  contract_id: string
  file_name: string
  file_path: string
  file_size: string
  file_type: string
  file_content: string
}

export type ContractDraft = {
  role?: any
  id: string
  draft: string
  createdAt: Date
  contractId: string
}

export type ContractDataField = {
  id: string
  field_name: string
  field_type: string
  value?: string
}

export type ContractSection = {
  id: string
  title: string
  description?: string
  createdAt: Date
  contractId: string
}
