import { Container, Title, Text, Button, Stack, Group } from '@mantine/core';
import { IconPalette, IconBrush } from '@tabler/icons-react';

export function LandingPage() {
  return (
    <Container size="xl" py={80} px={80}>
      <Stack align="center" gap="xl">
        <Title order={1} size="3.5rem">
          Pixel Gene
        </Title>

        <Text size="xl" c="dimmed" maw={600}>
          Create, edit and transform pixel art with powerful tools and an intuitive interface
        </Text>

        <Group mt={20}>
          <Button
            size="lg"
            leftSection={<IconPalette size={20} />}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
          >
            Start Creating
          </Button>
          
          <Button
            size="lg"
            leftSection={<IconBrush size={20} />}
            variant="light"
          >
            View Tutorial
          </Button>
        </Group>

        <Container size="sm" mt={48}>
          <Stack gap="lg">
            <Text fw={500} size="lg">
              Features:
            </Text>
            <Group justify="center" gap="xl">
              <Stack align="center">
                <Text fw={500}>Powerful Tools</Text>
                <Text size="sm" c="dimmed">
                  Full suite of pixel art creation tools
                </Text>
              </Stack>
              <Stack align="center">
                <Text fw={500}>Export Options</Text>
                <Text size="sm" c="dimmed">
                  Export to multiple formats
                </Text>
              </Stack>
              <Stack align="center">
                <Text fw={500}>Layer Support</Text>
                <Text size="sm" c="dimmed">
                  Work with multiple layers
                </Text>
              </Stack>
            </Group>
          </Stack>
        </Container>
      </Stack>
    </Container>
  );
}
