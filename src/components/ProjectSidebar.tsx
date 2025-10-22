import { ActionIcon, Box, Divider, Text } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { useProjectStore } from "../stores/projectStore";
import { useState, useMemo } from "react";
import { useUserProjects, useDeleteProject } from "../hooks/project";
import { Project } from "../types/api";
import {
  SidebarHeader,
  SidebarSearchAndActions,
  SidebarProjects,
  SidebarFooter,
  CreateFolderModal,
} from "./sidebar";
import { modals } from "@mantine/modals";

interface ProjectSidebarProps {
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  me: any;
  onLogout?: () => void;
  onNavigateToProfile?: () => void;
}

interface Folder {
  id: string;
  name: string;
  projectIds: number[];
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  onCreateProject,
  onEditProject,
  collapsed = false,
  onToggleCollapse,
  me,
  onLogout,
  onNavigateToProfile,
}) => {
  const { currentProjectId, setCurrentProjectId } = useProjectStore();
  const { refetch, data: projects, isLoading, error } = useUserProjects();
  const deleteProjectMutation = useDeleteProject();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [customFolders, setCustomFolders] = useState<Folder[]>([
    { id: "work", name: "Work", projectIds: [] },
    { id: "personal", name: "Personal", projectIds: [] },
  ]);
  const [createFolderModalOpened, setCreateFolderModalOpened] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [favoriteProjectIds, setFavoriteProjectIds] = useState<Set<number>>(
    new Set()
  );
  const [expandedFolders, setExpandedFolders] = useState<{
    [key: string]: boolean;
  }>({
    favorites: true,
    work: true,
    personal: true,
    unassigned: true,
  });

  const toggleFolder = (key: string) => {
    console.log("Toggling folder:", key);
    setExpandedFolders((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleFavorite = (projectId: number) => {
    setFavoriteProjectIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      console.log("Toggled favorite for project:", projectId, newSet);
      return newSet;
    });
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: Folder = {
        id: Date.now().toString(),
        name: newFolderName.trim(),
        projectIds: [],
      };
      console.log("Creating new folder:", newFolder);
      setCustomFolders([...customFolders, newFolder]);
      setExpandedFolders((prev) => ({ ...prev, [newFolder.id]: true }));
      setNewFolderName("");
      setCreateFolderModalOpened(false);
    }
  };

  const addProjectToFolder = (projectId: number, folderId: string) => {
    console.log("Adding project", projectId, "to folder", folderId);
    setCustomFolders((folders) =>
      folders.map((folder) => {
        const filteredIds = folder.projectIds.filter((id) => id !== projectId);
        if (folder.id === folderId) {
          return { ...folder, projectIds: [...filteredIds, projectId] };
        }
        return { ...folder, projectIds: filteredIds };
      })
    );
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const projectId = parseInt(draggableId.replace("project-", ""));
    if (source.droppableId !== destination.droppableId) {
      const destFolderId = destination.droppableId.replace("folder-", "");
      if (destFolderId !== "favorites" && destFolderId !== "all") {
        addProjectToFolder(projectId, destFolderId);
      }
    }
  };

  const handleSelectProject = (project: Project) => {
    setCurrentProjectId(project.id);
  };

  const handleDeleteProject = async (project: Project) => {
    modals.openConfirmModal({
      title: "Delete Project",
      children: (
        <Text size="xl">
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

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((project) => {
      if (!project || !project.name) {
        console.warn("Invalid project data:", project);
        return false;
      }
      const matchesSearch = project.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesRole = !filterRole || project.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [projects, searchTerm, filterRole]);

  const favoriteProjects = filteredProjects.filter((p) =>
    favoriteProjectIds.has(p.id)
  );

  const unassignedProjects = filteredProjects.filter((p) => {
    const isInAnyFolder = customFolders.some((folder) =>
      folder.projectIds.includes(p.id)
    );
    return !isInAnyFolder && !favoriteProjectIds.has(p.id);
  });

  console.log("Rendering ProjectSidebar, collapsed:", collapsed, "unassignedProjects:", unassignedProjects);

  return (
    <Box
      h="100vh"
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#141416",
        borderRight: "1px solid #393D5A",
      }}
    >
      {collapsed ? (
        <Box p="md" style={{ display: "flex", justifyContent: "center" }}>
          <ActionIcon
            size="lg"
            variant="subtle"
            color="gray"
            onClick={() => {
              onToggleCollapse?.();
            }}
          >
            <IconChevronRight size={20} />
          </ActionIcon>
        </Box>
      ) : (
        <>
          <SidebarHeader collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
          <SidebarSearchAndActions
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showAllProjects={showAllProjects}
            setShowAllProjects={setShowAllProjects}
            onCreateProject={onCreateProject}
          />
          {/* <Divider color="#393D5A" /> */}
          <SidebarProjects
            isLoading={isLoading}
            error={error}
            filteredProjects={filteredProjects}
            favoriteProjects={favoriteProjects}
            unassignedProjects={unassignedProjects}
            customFolders={customFolders}
            showAllProjects={showAllProjects}
            favoriteProjectIds={favoriteProjectIds}
            expandedFolders={expandedFolders}
            currentProjectId={currentProjectId}
            refetch={refetch}
            toggleFavorite={toggleFavorite}
            addProjectToFolder={addProjectToFolder}
            handleDragEnd={handleDragEnd}
            handleSelectProject={handleSelectProject}
            handleDeleteProject={handleDeleteProject}
            toggleFolder={toggleFolder}
            setCreateFolderModalOpened={setCreateFolderModalOpened}
            collapsed={collapsed}
          />
          <CreateFolderModal
            opened={createFolderModalOpened}
            newFolderName={newFolderName}
            setNewFolderName={setNewFolderName}
            handleCreateFolder={handleCreateFolder}
            setCreateFolderModalOpened={setCreateFolderModalOpened}
          />
          <SidebarFooter
            filteredProjects={filteredProjects}
            collapsed={collapsed}
            me={me}
            onLogout={onLogout}
            onNavigateToProfile={onNavigateToProfile}
          />
        </>
      )}
    </Box>
  );
};

export default ProjectSidebar;