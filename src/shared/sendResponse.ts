import { Response } from "express";

type Meta = {
  page: number;
  limit: number;
  total: number;
};

const sendResponse = <T>(
  res: Response,
  jsonData: {
    statusCode: number;
    success: boolean;
    message: string;
    meta?: Meta;
    data?: T | null;
  },
) => {
  res.status(jsonData.statusCode).json({
    success: jsonData.success,
    message: jsonData.message,
    meta: jsonData.meta,
    data: jsonData.data ?? null,
  });
};

export default sendResponse;
