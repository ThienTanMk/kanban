import {
  Box,
  Group,
  Stack,
  Text,
  Button,
  ScrollArea,
  UnstyledButton,
  Loader,
  ActionIcon,
  Tooltip,
  Badge,
  Menu,
  Avatar,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { useProjectStore } from "../stores/projectStore";
import { useUserProjects, useDeleteProject } from "../hooks/project";
import { Project } from "../types/api";
import dayjs from "dayjs";
interface ProjectSidebarProps {
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}
const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  onCreateProject,
  onEditProject,
  collapsed = false,
  onToggleCollapse,
}) => {
  const { currentProjectId, setCurrentProjectId } = useProjectStore();
  const { refetch, data: projects, isLoading, error } = useUserProjects();
  const deleteProjectMutation = useDeleteProject();
  const handleSelectProject = (project: Project) => {
    setCurrentProjectId(project.id);
  };
  const handleDeleteProject = async (project: Project) => {
    modals.openConfirmModal({
      title: "Delete Project",
      children: (
        <Text size="sm">
          Are you sure you want to delete "<strong>{project.name}</strong>"?
          This action cannot be undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteProjectMutation.mutateAsync(project.id);
        } catch (error) {
          console.error("Failed to delete project:", error);
        }
      },
    });
  };
  const ProjectItem: React.FC<{ project: Project }> = ({ project }) => {
    const isSelected = currentProjectId === project.id;
    const projectInitial = project.name.charAt(0).toUpperCase();
    if (collapsed) {
      return (
        <Tooltip label={project.name} position="right" withArrow>
          <UnstyledButton
            p="sm"
            style={{
              borderRadius: "8px",
              backgroundColor: isSelected
                ? "var(--mantine-color-blue-light)"
                : "transparent",
              border: isSelected
                ? "1px solid var(--mantine-color-blue-6)"
                : "1px solid transparent",
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
            onClick={() => handleSelectProject(project)}
          >
            <Avatar
              size="sm"
              color={isSelected ? "blue" : "gray"}
              variant={isSelected ? "filled" : "light"}
              radius="sm"
            >
              {projectInitial}
            </Avatar>
          </UnstyledButton>
        </Tooltip>
      );
    }
    return (
      <UnstyledButton
        p="sm"
        style={{
          borderRadius: "8px",
          backgroundColor: isSelected
            ? "var(--mantine-color-blue-light)"
            : "transparent",
          border: isSelected
            ? "1px solid var(--mantine-color-blue-6)"
            : "1px solid transparent",
          width: "100%",
          transition: "background-color 0.2s ease",
        }}
        onClick={() => handleSelectProject(project)}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor =
              "var(--mantine-color-gray-0)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
            <Avatar
              size="sm"
              color={isSelected ? "blue" : "gray"}
              variant={isSelected ? "filled" : "light"}
              radius="sm"
            >
              {projectInitial}
            </Avatar>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={isSelected ? 600 : 400} truncate>
                {project.name}
              </Text>
              {project.description && (
                <Text size="xs" c="dimmed" truncate>
                  {project.description}
                </Text>
              )}
              {project.endDate && (
                <Group gap={4} wrap="nowrap">
                  <IconCalendar size={10} />
                  <Text size="xs" c="dimmed">
                    Due: {dayjs(project.endDate).format("MMM DD")}
                  </Text>
                </Group>
              )}
            </Box>
          </Group>
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <IconDotsVertical size={14} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditProject(project);
                }}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(project);
                }}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </UnstyledButton>
    );
  };
  return (
    <Box h="100%" style={{ display: "flex", flexDirection: "column" }}>
      <Group justify="space-between" p="md" pb="sm" wrap="nowrap">
        {!collapsed && (
          <Text size="lg" fw={600}>
            Projects
          </Text>
        )}
        <Group gap="xs" wrap="nowrap">
          {!collapsed && (
            <Tooltip label="Create new project">
              <ActionIcon
                size="sm"
                variant="filled"
                color="blue"
                onClick={onCreateProject}
              >
                <IconPlus size={14} />
              </ActionIcon>
            </Tooltip>
          )}
          {onToggleCollapse && (
            <Tooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                onClick={onToggleCollapse}
              >
                {collapsed ? (
                  <IconChevronRight size={14} />
                ) : (
                  <IconChevronLeft size={14} />
                )}
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>
      {collapsed && (
        <Box px="md" pb="sm">
          <Tooltip label="Create new project" position="right" withArrow>
            <ActionIcon
              size="md"
              variant="filled"
              color="blue"
              onClick={onCreateProject}
              style={{ width: "100%" }}
            >
              <IconPlus size={16} />
            </ActionIcon>
          </Tooltip>
        </Box>
      )}
      <ScrollArea flex={1} px="md">
        <Stack gap="xs">
          {isLoading && (
            <Group justify="center" py="xl">
              <Loader size="sm" />
              {!collapsed && (
                <Text size="sm" c="dimmed">
                  Loading projects...
                </Text>
              )}
            </Group>
          )}
          {error && !collapsed && (
            <Box p="sm" style={{ textAlign: "center" }}>
              <Text size="sm" c="red" mb="sm">
                {error?.message || "Failed to load projects"}
              </Text>
              <Button size="xs" variant="light" onClick={() => refetch()}>
                Retry
              </Button>
            </Box>
          )}
          {error && collapsed && (
            <Tooltip label={error?.message} position="right" withArrow>
              <ActionIcon
                color="red"
                variant="light"
                size="sm"
                style={{ width: "100%" }}
              >
                !
              </ActionIcon>
            </Tooltip>
          )}
          {!isLoading && !error && projects?.length === 0 && !collapsed && (
            <Box p="xl" style={{ textAlign: "center" }}>
              <Text size="sm" c="dimmed" mb="sm">
                No projects yet
              </Text>
              <Button
                size="xs"
                variant="light"
                onClick={onCreateProject}
                leftSection={<IconPlus size={14} />}
              >
                Create your first project
              </Button>
            </Box>
          )}
          {!isLoading &&
            !error &&
            projects?.map((project) => (
              <ProjectItem key={project.id} project={project} />
            ))}
        </Stack>
      </ScrollArea>
      {!collapsed && (
        <Box
          p="md"
          pt="sm"
          style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}
        >
          <Text size="xs" c="dimmed" ta="center">
            {projects?.length} project{projects?.length !== 1 ? "s" : ""}
          </Text>
        </Box>
      )}
    </Box>
  );
};
export default ProjectSidebar;
