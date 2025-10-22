import {
  Box,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
  Divider,
} from "@mantine/core";
import { IconSearch, IconPlus, IconList } from "@tabler/icons-react";

interface SidebarSearchAndActionsProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  showAllProjects: boolean;
  setShowAllProjects: (value: boolean) => void;
  onCreateProject: () => void;
}

export const SidebarSearchAndActions: React.FC<
  SidebarSearchAndActionsProps
> = ({
  searchTerm,
  setSearchTerm,
  showAllProjects,
  setShowAllProjects,
  onCreateProject,
}) => {
  return (
    <Box p="md">
      <Stack gap="xs">
        <Text
          size="sm"
          fw={600}
          c="#7E7E8F"
          mt={4}
          style={{ letterSpacing: "0.5px" }}
        >
          Main
        </Text>
        {/* --- Clickable Label (Projects / Folders) --- */}
        <UnstyledButton
          onClick={() => setShowAllProjects(!showAllProjects)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 8px",
            borderRadius: "6px",
            color: "#D0D4E4",
            backgroundColor: showAllProjects
              ? "rgba(255,255,255,0.08)"
              : "transparent",
            fontWeight: showAllProjects ? 600 : 500,
            cursor: "pointer",
            transition: "background-color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            if (!showAllProjects)
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
          }}
          onMouseLeave={(e) => {
            if (!showAllProjects)
              e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <IconList size={16} />
          <Text size="sm" flex={1}>
            {showAllProjects ? "All Projects" : "Folders"}
          </Text>
        </UnstyledButton>

        {/* --- Add Project --- */}
        <UnstyledButton
          onClick={onCreateProject}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 8px",
            borderRadius: "6px",
            color: "#D0D4E4",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background-color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <IconPlus size={16} />
          <Text size="sm" flex={1}>
            Add Project
          </Text>
        </UnstyledButton>

        {/* --- Search --- */}
        <TextInput
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          leftSectionPointerEvents="none"
          style={{ flex: 1 }}
          size="sm"
        />
      </Stack>
    </Box>
  );
};
