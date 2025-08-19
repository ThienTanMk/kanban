import { useState } from "react";
import { AppShell, Group, Button, Text, Avatar, Menu } from "@mantine/core";
import { IconUser, IconSettings, IconLogout } from "@tabler/icons-react";
import ProjectSidebar from "./ProjectSidebar";
import ProjectModal from "./ProjectModal";
import { Project } from "../types/api";
import { useGetMe } from "@/hooks/user";
interface AppLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  onNavigateToProfile: () => void;
}
export default function AppLayout({
  children,
  onLogout,
  onNavigateToProfile,
}: AppLayoutProps) {
  const { data: me } = useGetMe();
  const [projectModalOpened, setProjectModalOpened] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const handleCreateProject = () => {
    setEditingProject(null);
    setProjectModalOpened(true);
  };
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectModalOpened(true);
  };
  const handleCloseModal = () => {
    setProjectModalOpened(false);
    setEditingProject(null);
  };
  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: sidebarCollapsed ? 80 : 300,
        breakpoint: "sm",
        collapsed: { mobile: false },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Text size="xl" fw={700} c="blue">
              TaskBoard
            </Text>
          </Group>
          <Group gap="sm">
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button
                  variant="subtle"
                  leftSection={
                    <Avatar size="sm" src={me?.avatar} radius="xl">
                      {me?.name?.charAt(0)}
                    </Avatar>
                  }
                >
                  {me?.name}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{me?.email}</Menu.Label>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconUser size={14} />}
                  onClick={onNavigateToProfile}
                >
                  Profile
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconLogout size={14} />}
                  color="red"
                  onClick={onLogout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar>
        <ProjectSidebar
          onCreateProject={handleCreateProject}
          onEditProject={handleEditProject}
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
      <ProjectModal
        opened={projectModalOpened}
        onClose={handleCloseModal}
        project={editingProject}
      />
    </AppShell>
  );
}
