import { List, ListItem, ListItemText, Typography } from "@mui/material";
import ListContainer from "components/ListContainer";
import { formatDistanceToNow } from "date-fns";
import useSourcemapHistory from "hooks/useSourcemapHistory";
import React from "react";
import { useParams } from "react-router-dom";

function SourcemapHistory() {
  const { projectId } = useParams();
  const { data, isLoading, error } = useSourcemapHistory(projectId);

  return (
    <>
      <Typography variant="h2" mb={3}>
        Sourcemap History
      </Typography>
      <ListContainer
        count={data?.length}
        loading={isLoading}
        emptyText="No sourcemaps uploaded yet."
        error={error?.message}
      >
        <List>
          {data?.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={formatDistanceToNow(new Date(item.uploaded_at), {
                  addSuffix: true,
                })}
                secondary={new Date(item.uploaded_at).toLocaleString()}
              />
            </ListItem>
          ))}
        </List>
      </ListContainer>
    </>
  );
}

export default SourcemapHistory;
