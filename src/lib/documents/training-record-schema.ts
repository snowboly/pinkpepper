export type TrainingQualificationRow = {
  qualification: string;
  level: string;
  provider: string;
  dateAchieved: string;
  certificateNumber: string;
  expiryDate: string;
};

export type TrainingLogRow = {
  date: string;
  topic: string;
  trainer: string;
  duration: string;
  assessment: string;
  signature: string;
};

export type TrainingRecordData = {
  metadata: {
    businessName: string;
    docNo: string;
    version: string;
    date: string;
    approvedBy: string;
  };
  employeeName: string;
  jobRole: string;
  department: string;
  startDate: string;
  inductionCompleted: boolean;
  inductionDate: string;
  trainerName: string;
  inductionTopics: string[];
  inductionAssessment: string;
  qualifications: TrainingQualificationRow[];
  trainingLogRows: TrainingLogRow[];
};
