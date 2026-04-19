import { useParams } from "react-router-dom";

const useProjectId = () => {
  const { projectId } = useParams();
  return projectId;
};

export default useProjectId;
