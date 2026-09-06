import { getStoredResources } from './resourceService';
import { getStoredSubjects } from './subjectService';

const CHAT_STORAGE_KEY = 'iert_ai_chat_history_v1';

/**
 * Storage helpers for local AI chat history
 */
export function getStoredChatHistory() {
  const data = localStorage.getItem(CHAT_STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

export function saveChatHistory(messages) {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  window.dispatchEvent(new Event('iert_ai_chat_updated'));
}

export function clearChatHistory() {
  localStorage.removeItem(CHAT_STORAGE_KEY);
  window.dispatchEvent(new Event('iert_ai_chat_updated'));
}

/**
 * Comprehensive Academic Knowledge Base for Semester 3 B.Tech Cyber Security
 */
const ACADEMIC_KNOWLEDGE_BASE = {
  CS301: {
    code: 'CS301',
    name: 'Data Structures & Algorithms',
    topics: {
      'unit 1': {
        title: 'Stacks, Queues & Arrays',
        content: `### Unit 1: Stacks, Queues & Array Operations
- **Stack**: Linear data structure following **LIFO** (Last In First Out). Core operations are \`push()\`, \`pop()\`, \`peek()\`. Used in function call stacks, expression evaluation (Infix to Postfix), and backtracking.
- **Queue**: Linear data structure following **FIFO** (First In First Out). Core operations are \`enqueue()\`, \`dequeue()\`. Variants include Circular Queue, Double-Ended Queue (Deque), and Priority Queue.
- **Applications**: Process scheduling in OS, BFS graph traversal, memory management.`
      },
      'unit 2': {
        title: 'Linked Lists',
        content: `### Unit 2: Linked Lists
- **Singly Linked List**: Sequence of nodes where each node contains data and a pointer (\`next\`) to the subsequent node.
- **Doubly Linked List**: Nodes contain data, \`prev\` pointer, and \`next\` pointer allowing bidirectional traversal.
- **Circular Linked List**: Last node points back to the head node.
- **Time Complexity**: Insertion/Deletion at head is **O(1)**; Search is **O(n)**.`
      },
      'unit 3': {
        title: 'Trees & Binary Search Trees (BST)',
        content: `### Unit 3: Trees & Binary Search Trees
- **Binary Tree**: Tree structure where each node has at most 2 children (left and right).
- **BST Property**: Left subtree values < Root value < Right subtree values.
- **Traversals**: Inorder (Left, Root, Right -> sorted order), Preorder (Root, Left, Right), Postorder (Left, Right, Root).
- **AVL Trees**: Self-balancing binary search trees maintaining height difference (balance factor) \`|h_L - h_R| <= 1\`.`
      },
      'unit 4': {
        title: 'Graphs & Sorting Algorithms',
        content: `### Unit 4: Graphs & Sorting Algorithms
- **Graph Traversal**: **BFS** (Breadth-First Search using Queue) and **DFS** (Depth-First Search using Stack/Recursion).
- **Shortest Path**: Dijkstra's Algorithm, Bellman-Ford, Floyd-Warshall.
- **Sorting Algorithms**:
  - **Quick Sort**: Divide-and-conquer using pivot. Average **O(n log n)**, Worst **O(n²)**.
  - **Merge Sort**: Stable divide-and-conquer algorithm. Always **O(n log n)**.
  - **Heap Sort**: Uses binary heap data structure. **O(n log n)**.`
      }
    }
  },
  CS302: {
    code: 'CS302',
    name: 'Computer Organization & Architecture',
    topics: {
      'unit 1': {
        title: 'Basic Structure & Instruction Set',
        content: `### Unit 1: Basic Computer Structure & CPU
- **Von Neumann Architecture**: Single memory space for both data and instructions. Comprises CPU (ALU, Control Unit, Registers) and Memory.
- **Instruction Cycle**: Fetch -> Decode -> Execute -> Store.
- **Addressing Modes**: Immediate, Direct, Indirect, Register Direct, Register Indirect, Indexed, Relative.`
      },
      'unit 2': {
        title: 'Computer Arithmetic & ALU',
        content: `### Unit 2: Computer Arithmetic
- **Fixed-Point Arithmetic**: Addition, Subtraction using 2's Complement representation.
- **Booth's Algorithm**: Efficient multiplication algorithm for signed binary integers.
- **IEEE 754 Floating-Point**: Single Precision (32-bit: 1 sign, 8 exponent, 23 mantissa) and Double Precision (64-bit).`
      },
      'unit 3': {
        title: 'Memory Hierarchy & Cache Memory',
        content: `### Unit 3: Memory Organization
- **Memory Hierarchy**: Registers -> Cache Memory (L1, L2, L3) -> Main Memory (DRAM) -> Secondary Storage (SSD/HDD).
- **Cache Mapping**: Direct Mapping, Fully Associative Mapping, Set-Associative Mapping.
- **Cache Replacement Policies**: LRU (Least Recently Used), FIFO, Random.`
      },
      'unit 4': {
        title: 'Pipelining & I/O Organization',
        content: `### Unit 4: Instruction Pipelining & I/O
- **Pipelining**: Overlapping execution of instructions across stages (Fetch, Decode, Execute, Writeback).
- **Pipeline Hazards**: Structural Hazards, Data Hazards (RAW, WAR, WAW), Control Hazards (Branches).
- **I/O Transfer Modes**: Programmed I/O, Interrupt-driven I/O, Direct Memory Access (DMA).`
      }
    }
  },
  CS303: {
    code: 'CS303',
    name: 'Operating Systems',
    topics: {
      'unit 1': {
        title: 'OS Overview & Process Management',
        content: `### Unit 1: OS Concepts & Process Control
- **Operating System Role**: Manages hardware resources, provides abstraction layer and user interface.
- **Process State Transition**: New -> Ready -> Running -> Waiting -> Terminated.
- **PCB (Process Control Block)**: Stores Process ID, Program Counter, CPU registers, memory limits, and open files list.`
      },
      'unit 2': {
        title: 'CPU Scheduling & Synchronization',
        content: `### Unit 2: CPU Scheduling & Inter-Process Communication
- **Scheduling Algorithms**:
  - **FCFS**: Non-preemptive, subject to convoy effect.
  - **SJF**: Optimal average waiting time, risk of starvation.
  - **Round Robin (RR)**: Preemptive scheduling with time quantum.
- **Process Synchronization**: Critical Section Problem. Solutions include Semaphores (Counting & Binary/Mutex), Monitors, and Peterson's Solution.`
      },
      'unit 3': {
        title: 'Deadlocks',
        content: `### Unit 3: Deadlock Handling
- **4 Necessary Conditions for Deadlock**:
  1. Mutual Exclusion
  2. Hold and Wait
  3. No Preemption
  4. Circular Wait
- **Deadlock Handling**: Avoidance (**Banker's Algorithm**), Prevention (breaking 1 condition), Detection & Recovery.`
      },
      'unit 4': {
        title: 'Memory Management & Paging',
        content: `### Unit 4: Memory & Virtual Memory
- **Paging**: Non-contiguous memory allocation splitting logical memory into pages and physical memory into frames.
- **Page Fault**: Occurs when a requested page is not currently present in RAM.
- **Virtual Memory**: Allows execution of processes requiring more memory than available physical RAM using Demand Paging.
- **Page Replacement Algorithms**: FIFO, LRU (Least Recently Used), Optimal Page Replacement.`
      }
    }
  },
  CY301: {
    code: 'CY301',
    name: 'Cyber Security Fundamentals',
    topics: {
      'unit 1': {
        title: 'Security Principles & CIA Triad',
        content: `### Unit 1: Core Security Concepts & CIA Triad
- **Confidentiality**: Ensuring data is accessible only to authorized entities (Encryption, Access Control).
- **Integrity**: Safeguarding accuracy and completeness of data against unauthorized modification (Hashing, Digital Signatures).
- **Availability**: Ensuring timely and reliable access to data and systems (Redundancy, Backups, DDoS Mitigation).
- **Threat vs Vulnerability vs Risk**: Vulnerability is a weakness; Threat exploits it; Risk is potential loss.`
      },
      'unit 2': {
        title: 'Cryptography & Encryption',
        content: `### Unit 2: Cryptographic Primitives
- **Symmetric Encryption**: Same key used for encryption and decryption (AES, DES, 3DES). Fast, key distribution challenge.
- **Asymmetric Encryption**: Public key encrypts, Private key decrypts (RSA, ECC, Diffie-Hellman). Enables digital signatures.
- **Cryptographic Hash Functions**: SHA-256, MD5. One-way deterministic functions producing fixed-size digests.`
      },
      'unit 3': {
        title: 'Network Security & Firewalls',
        content: `### Unit 3: Network Protection Mechanisms
- **Firewalls**: Packet-filtering, Stateful Inspection, Next-Gen Firewalls (NGFW).
- **IDS / IPS**: Intrusion Detection Systems (Alerts) vs Intrusion Prevention Systems (Inline blocking).
- **Malware Types**: Viruses (self-replicating via host), Worms (standalone network replication), Trojans, Ransomware, Spyware, Rootkits.`
      },
      'unit 4': {
        title: 'Cyber Laws & Ethics',
        content: `### Unit 4: Cyber Legislation & Ethical Hacking
- **IT Act 2000 (India)**: Provides legal recognition for electronic transactions and defines cybercrime penalties (Sec 66, 66B, 66C, 66D, 67).
- **Ethical Hacking Phases**: Reconnaissance -> Scanning -> Gaining Access -> Maintaining Access -> Clearing Tracks.
- **Cyber Ethics**: Responsible vulnerability disclosure, privacy rights, legal authorization compliance.`
      }
    }
  },
  MA301: {
    code: 'MA301',
    name: 'Discrete Mathematics & Graph Theory',
    topics: {
      'unit 1': {
        title: 'Set Theory & Mathematical Logic',
        content: `### Unit 1: Sets, Logic & Relations
- **Propositional Logic**: Truth tables, Tautologies, Contradictions, Logical equivalences (\`P -> Q \equiv \neg P \lor Q\`).
- **Relations**: Reflexive, Symmetric, Transitive. Equivalence relations partition a set into equivalence classes.`
      },
      'unit 2': {
        title: 'Graph Theory Fundamentals',
        content: `### Unit 2: Graphs & Trees
- **Graph Definitions**: Vertices, Edges, Degree of a vertex (\`\sum deg(v) = 2|E|\` Handshaking Lemma).
- **Eulerian Graph**: Contains closed trail visiting every edge exactly once (All vertices have even degree).
- **Hamiltonian Graph**: Contains closed cycle visiting every vertex exactly once.`
      }
    }
  },
  HU301: {
    code: 'HU301',
    name: 'Technical Communication & Cyber Ethics',
    topics: {
      'unit 1': {
        title: 'Professional Communication & Ethics',
        content: `### Unit 1: Technical Writing & Ethics
- **Technical Communication**: Clarity, Conciseness, Precision, Audience-centered approach.
- **Professional Ethics**: Integrity, Accountability, Respect for Intellectual Property Rights (IPR) and Copyright Laws.`
      }
    }
  }
};

/**
 * Main AI Query Generator with Material Context Integration
 */
export async function askAIStudyAssistant({ prompt, subjectId = 'CY301', unit = 'all', mode = 'chat' }) {
  if (!prompt || !prompt.trim()) {
    throw new Error('Please enter a question for the AI Assistant.');
  }

  const cleanPrompt = prompt.trim();
  const lowerPrompt = cleanPrompt.toLowerCase();

  // Check available IERT HUB academic resources for citation
  const storedResources = getStoredResources();
  const matchingResources = storedResources.filter(r => {
    const subMatch = !subjectId || subjectId === 'all' || r.subjectId?.toLowerCase() === subjectId.toLowerCase();
    const unitMatch = !unit || unit === 'all' || String(r.unit) === String(unit);
    return subMatch && unitMatch;
  });

  // Prepare citation list
  const citationList = matchingResources.slice(0, 3).map(r => ({
    id: r.id,
    title: r.title,
    type: r.type,
    subjectId: r.subjectId,
    unit: r.unit,
    year: r.year
  }));

  // Simulate fast response delay
  await new Promise(res => setTimeout(res, 600));

  // Determine subject knowledge base
  const subjectObj = ACADEMIC_KNOWLEDGE_BASE[subjectId] || ACADEMIC_KNOWLEDGE_BASE.CY301;
  let relevantTopic = null;

  if (unit && unit !== 'all') {
    const key = `unit ${unit}`;
    if (subjectObj.topics && subjectObj.topics[key]) {
      relevantTopic = subjectObj.topics[key];
    }
  }

  // Synthesize structured answer
  let responseMarkdown = '';

  if (lowerPrompt.includes('deadlock')) {
    responseMarkdown = `### Operating Systems: Deadlocks & Prevention

A **Deadlock** is a situation in an operating system where a set of processes are blocked because each process holds a resource and waits for another resource held by another process.

#### 4 Necessary Conditions for Deadlock:
1. **Mutual Exclusion**: At least one resource must be held in a non-shareable mode.
2. **Hold and Wait**: A process holds at least one resource and waits to acquire additional resources.
3. **No Preemption**: Resources cannot be preempted; a resource is released only voluntarily.
4. **Circular Wait**: A closed chain of processes exists such that each process holds resources needed by the next.

#### Deadlock Handling Techniques:
- **Prevention**: Break at least one of the 4 conditions.
- **Avoidance**: Use **Banker's Algorithm** to dynamically check safe states before allocating resources.
- **Detection & Recovery**: Allow deadlock to occur, detect it via Resource Allocation Graph (RAG), and terminate deadlocked processes.`;
  } else if (lowerPrompt.includes('cia') || lowerPrompt.includes('triad')) {
    responseMarkdown = `### Cyber Security: CIA Triad Fundamentals

The **CIA Triad** forms the foundational benchmark for evaluating information security controls.

#### 1. Confidentiality
- **Goal**: Protects sensitive data from unauthorized access or disclosure.
- **Mechanisms**: Symmetric/Asymmetric Encryption (AES, RSA), Access Control Lists (ACLs), Multi-Factor Authentication (MFA).

#### 2. Integrity
- **Goal**: Ensures data remains accurate, complete, and untampered during storage and transmission.
- **Mechanisms**: Cryptographic Hash Functions (SHA-256), Digital Signatures, Checksums.

#### 3. Availability
- **Goal**: Guarantees timely and uninterrupted access to services and information for authorized users.
- **Mechanisms**: Redundant Hardware, Data Backups, Disaster Recovery Plans, DDoS Mitigation (Cloudflare, Firewalls).`;
  } else if (lowerPrompt.includes('linked list')) {
    responseMarkdown = `### Data Structures: Linked Lists Explained

A **Linked List** is a linear data structure where elements are not stored at contiguous memory locations. Instead, elements (nodes) are linked using pointers.

#### Node Structure:
\`\`\`cpp
struct Node {
    int data;
    Node* next;
};
\`\`\`

#### Key Types:
1. **Singly Linked List**: Each node points to the next node; last points to \`NULL\`.
2. **Doubly Linked List**: Nodes contain \`prev\` and \`next\` pointers.
3. **Circular Linked List**: Tail node's \`next\` points back to the \`head\` node.

#### Time Complexities:
- **Access / Search**: **O(n)**
- **Insertion at Head**: **O(1)**
- **Deletion at Head**: **O(1)**`;
  } else if (lowerPrompt.includes('paging') || lowerPrompt.includes('page fault')) {
    responseMarkdown = `### Operating Systems: Memory Paging & Page Faults

**Paging** is a memory management scheme that eliminates the need for contiguous allocation of physical memory.

#### Core Components:
- **Pages**: Fixed-size blocks of logical memory.
- **Frames**: Fixed-size blocks of physical memory (RAM).
- **Page Table**: Data structure maintained by OS to translate Logical Address \`(Page #, Offset)\` into Physical Address \`(Frame #, Offset)\`.

#### Page Fault Handling:
A **Page Fault** occurs when a process accesses a page not currently loaded in physical RAM.
1. CPU traps to OS.
2. OS locates the required page on secondary disk storage.
3. OS finds a free RAM frame (or executes a Page Replacement algorithm like **LRU**).
4. Page is read into frame, Page Table updated, and instruction restarted.`;
  } else if (relevantTopic) {
    responseMarkdown = `${relevantTopic.content}

#### Explanation for "${cleanPrompt}":
Regarding **${subjectObj.name} (${subjectObj.code}) ${unit !== 'all' ? `Unit ${unit}` : ''}**:
${cleanPrompt} is a core academic topic. Focus on mastering key definitions, mathematical/algorithmic formulation, and standard exam diagrams.`;
  } else {
    responseMarkdown = `### Academic Explanation: ${subjectObj.name} (${subjectObj.code})

Regarding your question: **"${cleanPrompt}"**

#### Overview:
In **${subjectObj.name}**, this topic focuses on foundational principles essential for B.Tech Cyber Security Semester 3:

1. **Core Concept**: Understand the mathematical model, architectural specification, or algorithmic flow.
2. **Key Application**: Used in securing network layers, optimizing algorithmic time complexity, or managing system resources.
3. **Exam Focus**: Pay close attention to standard definitions, execution diagrams, and comparison matrices.

> 💡 *Tip: Check the recommended reading materials for ${subjectObj.code} available under the Notes and Study Material sections of IERT HUB.*`;
  }

  return {
    markdown: responseMarkdown,
    citations: citationList,
    subjectId: subjectObj.code,
    subjectName: subjectObj.name,
    timestamp: new Date().toISOString(),
    hasMaterialMatch: citationList.length > 0
  };
}

/**
 * Practice Quiz Questions Generator (Real Semester 3 Academic Bank)
 */
const PRACTICE_QUIZ_BANK = {
  CS301: [
    {
      id: 'q-cs301-1',
      question: 'Which data structure follows the LIFO (Last In First Out) principle?',
      options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
      correctIndex: 1,
      explanation: 'A Stack strictly operates on LIFO order, where elements pushed last are popped first.'
    },
    {
      id: 'q-cs301-2',
      question: 'What is the worst-case time complexity of Quick Sort?',
      options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(1)'],
      correctIndex: 2,
      explanation: 'Quick Sort degrades to O(n²) when the pivot is consistently chosen as the smallest or largest element.'
    },
    {
      id: 'q-cs301-3',
      question: 'Inorder traversal of a Binary Search Tree (BST) produces elements in which order?',
      options: ['Reverse Order', 'Sorted Ascending Order', 'Unsorted Random Order', 'Preorder Sequence'],
      correctIndex: 1,
      explanation: 'Inorder traversal visits Left -> Root -> Right, yielding elements in strictly sorted ascending order.'
    }
  ],
  CS302: [
    {
      id: 'q-cs302-1',
      question: 'Which mapping technique allows a block of memory to be placed in any cache line?',
      options: ['Direct Mapping', 'Fully Associative Mapping', 'Set-Associative Mapping', 'Segmented Mapping'],
      correctIndex: 1,
      explanation: 'Fully Associative Mapping allows memory blocks to be loaded into any free cache line.'
    },
    {
      id: 'q-cs302-2',
      question: 'Booth\'s Algorithm is specifically used for which arithmetic operation?',
      options: ['Floating-point division', 'Signed binary integer multiplication', 'Unsigned binary addition', 'Logical XOR operations'],
      correctIndex: 1,
      explanation: 'Booth\'s algorithm efficiently multiplies signed 2\'s complement binary integers.'
    }
  ],
  CS303: [
    {
      id: 'q-cs303-1',
      question: 'Which of the following is NOT one of the 4 necessary conditions for Deadlock?',
      options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
      correctIndex: 2,
      explanation: 'Deadlock requires NO preemption. If preemption is allowed, deadlock cannot occur.'
    },
    {
      id: 'q-cs303-2',
      question: 'Banker\'s Algorithm is used for which aspect of deadlock management?',
      options: ['Deadlock Detection', 'Deadlock Avoidance', 'Deadlock Prevention', 'Deadlock Recovery'],
      correctIndex: 1,
      explanation: 'Banker\'s algorithm dynamically checks resource requests against safe states to avoid deadlocks.'
    },
    {
      id: 'q-cs303-3',
      question: 'What occurs when a requested memory page is not present in RAM?',
      options: ['Segmentation Fault', 'Page Fault', 'Stack Overflow', 'Cache Miss'],
      correctIndex: 1,
      explanation: 'A Page Fault traps to the OS to fetch the missing page from disk into physical RAM.'
    }
  ],
  CY301: [
    {
      id: 'q-cy301-1',
      question: 'Which security goal is compromised when unauthorized modifications are made to a file?',
      options: ['Confidentiality', 'Integrity', 'Availability', 'Non-repudiation'],
      correctIndex: 1,
      explanation: 'Integrity ensures data remains accurate and unaltered by unauthorized parties.'
    },
    {
      id: 'q-cy301-2',
      question: 'Which encryption algorithm is a widely used Symmetric Key cipher?',
      options: ['RSA', 'AES', 'ECC', 'Diffie-Hellman'],
      correctIndex: 1,
      explanation: 'AES (Advanced Encryption Standard) is a symmetric block cipher using the same secret key.'
    },
    {
      id: 'q-cy301-3',
      question: 'Under the Indian IT Act 2000, which section prescribes penalties for computer-related offenses?',
      options: ['Section 66', 'Section 144', 'Section 302', 'Section 420'],
      correctIndex: 0,
      explanation: 'Section 66 of the IT Act 2000 deals with computer-related offenses and hacking penalties.'
    }
  ],
  MA301: [
    {
      id: 'q-ma301-1',
      question: 'According to the Handshaking Lemma, the sum of degrees of all vertices in a graph equals:',
      options: ['|E|', '2 * |E|', '|V|²', '|E| / 2'],
      correctIndex: 1,
      explanation: 'The Handshaking Lemma states that ∑ deg(v) = 2|E| because every edge contributes 2 to the degree total.'
    }
  ],
  HU301: [
    {
      id: 'q-hu301-1',
      question: 'What is the primary objective of responsible vulnerability disclosure in Cyber Ethics?',
      options: ['Publicly exploit flaws immediately', 'Notify vendor privately to fix before public disclosure', 'Sell exploits on dark web', 'Ignore security bugs'],
      correctIndex: 1,
      explanation: 'Responsible disclosure gives vendors reasonable time to patch vulnerabilities before public release.'
    }
  ]
};

export function generatePracticeQuiz({ subjectId = 'CY301', count = 3 }) {
  const bank = PRACTICE_QUIZ_BANK[subjectId] || PRACTICE_QUIZ_BANK.CY301;
  const shuffled = [...bank].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Quick Study Tools (Explain Simply, Summarize, Revision Points)
 */
export async function runStudyTool({ toolType, input, subjectId = 'CY301' }) {
  if (!input || !input.trim()) {
    throw new Error('Please enter text or a topic for the study tool.');
  }

  await new Promise(res => setTimeout(res, 400));
  const text = input.trim();
  const subjectObj = ACADEMIC_KNOWLEDGE_BASE[subjectId] || ACADEMIC_KNOWLEDGE_BASE.CY301;

  if (toolType === 'explain') {
    return `### 💡 Simple Explanation: ${text}

In simple terms:
Think of **${text}** like an everyday ruleset in computing or cyber security. 

1. **Why it matters**: It helps systems run smoothly, securely, and without conflicts.
2. **Key takeaway**: Master the core definitions, standard memory/data representations, and step-by-step processing rules.`;
  }

  if (toolType === 'summarize') {
    return `### 📝 Key Summary: ${text}

- **Core Topic**: ${text} (${subjectObj.code})
- **Primary Objective**: Efficient resource allocation, algorithmic stability, or secure data transmission.
- **Key Concepts**:
  - Structured execution flow
  - Error checking and validation
  - Optimization for Semester 3 examination requirements`;
  }

  if (toolType === 'revision') {
    return `### ⚡ Quick Revision Points: ${text}

- [ ] **Definition**: Clear 1-sentence definition of ${text}.
- [ ] **Diagram / Schema**: Practice drawing standard flowchart, state diagram, or architectural diagram.
- [ ] **Formula / Algorithm**: Review time/space complexity or mathematical formula.
- [ ] **Key Terms**: Memorize key technical vocabulary associated with ${subjectObj.code}.`;
  }

  return `Analysis completed for topic: ${text}`;
}
