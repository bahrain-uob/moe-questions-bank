import { Table, StackContext } from "sst/constructs";

export function DBStack({ stack, app }: StackContext) {
  // DynamoDB users table
  const users_table = new Table(stack, "Users", {
    fields: {
      email: "string",
      role: "string",
    },
    primaryIndex: { partitionKey: "email" },
  });

  // DynamoDB exams table
  const exams_table = new Table(stack, "Exams", {
    fields: {
      examID: "string",
      examState: "string",
      examClass: "string",
      examSubject: "string",
      examSemester: "string",
      createdBy: "string",
      creationDate: "string",
      contributers: "string",
      examContent: "string",
      examDuration: "string",
      examTotalMark: "number",
      numOfRegenerations: "number",
      approverMsg: "string",
    },
    primaryIndex: { partitionKey: "examID" },
    globalIndexes: {
      examStateIndex: { partitionKey: "examState" },
    },
  });

  return { users_table, exams_table };
}
