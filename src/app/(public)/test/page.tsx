// "use client";
// import { useState } from "react";
// import AddTaskModal from "@/components/AddTaskModal";
// import GenerativeTaskModal from "@/components/agent/GenerativeTaskModal";
// import { Button } from "@mantine/core";
// import { Priority } from "@/types/api";

// export default function TestPage() {
//   const [addOpened, setAddOpened] = useState(false);
//   const [genOpened, setGenOpened] = useState(false);

//   const [genPayload, setGenPayload] = useState(null);

//   return (
//     <>
//       <Button onClick={() => setAddOpened(true)}>Open Add Task</Button>

//       <AddTaskModal
//         opened={addOpened}
//         onClose={() => setAddOpened(false)}
//         initialDeadline={null}
//         onAddTask={() => {}}
//         onGenerate={(payload) => {
//           setAddOpened(false);          // đóng add modal
//           setGenPayload(payload);       // lưu payload để AI xử lý
//           setGenOpened(true);           // mở generative modal
//         }}
//       />

//       {genPayload && (
//         <GenerativeTaskModal
//           opened={genOpened}
//           onClose={() => setGenOpened(false)}
//           projectName="Demo Project"
//           initialTitle={genPayload.title}
//           initialDescription={genPayload.description}
//           initialPriority={genPayload.priority}
//           initialAssignees={genPayload.assignees}
//           initialDeadline={genPayload.deadline}
//           onPrefer={() => {
//             setGenOpened(false);
//             setAddOpened(true);   
//           }}
//         />
//       )}
//     </>
//   );
// }
export default function TestPage() {
  return <div>Hello</div>;
}
