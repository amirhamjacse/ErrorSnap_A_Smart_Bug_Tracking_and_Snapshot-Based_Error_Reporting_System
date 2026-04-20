export const recordSessionStart = async (_req, res) => {
  return res.status(200).json({
    message: "Session tracked",
    data: {
      enabled: false,
    },
  });
};
