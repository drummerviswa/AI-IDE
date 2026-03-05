"use client";

import React, { useRef } from "react";
import { useState, useCallback } from "react";
import { TemplateFileTree } from "@/features/playground/components/playground-explorer";
import type { TemplateFile } from "@/features/playground/libs/path-to-json";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  FileText,
  FolderOpen,
  AlertCircle,
  Save,
  X,
  Settings,
  Package,
  Loader2,
  Blocks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import WebContainerPreview from "@/features/webcontainers/components/webcontainer-preveiw";
import TerminalComponent, { type TerminalRef } from "@/features/webcontainers/components/terminal";
import LoadingStep from "@/components/ui/loader";
import { PlaygroundEditor } from "@/features/playground/components/playground-editor";
import ToggleAI from "@/features/playground/components/toggle-ai";
import { useFileExplorer } from "@/features/playground/hooks/useFileExplorer";
import { usePlayground } from "@/features/playground/hooks/usePlayground";
import { useAISuggestions } from "@/features/playground/hooks/useAISuggestion";
import { useWebContainer } from "@/features/webcontainers/hooks/useWebContainer";
import { SaveUpdatedCode } from "@/features/playground/actions";
import { TemplateFolder } from "@/features/playground/types";
import { findFilePath } from "@/features/playground/libs";
import { ConfirmationDialog } from "@/features/playground/components/dialogs/conformation-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import UserButton from "@/features/auth/components/user-button";

const MainPlaygroundPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // UI state
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const [isExtensionsDialogOpen, setIsExtensionsDialogOpen] = useState(false);
  const [packageCommand, setPackageCommand] = useState("npm install cors");
  const [isRunningPackageCommand, setIsRunningPackageCommand] = useState(false);
  const [installedExtensions, setInstalledExtensions] = useState<string[]>([]);

  const extensionCatalog = [
    {
      id: "emmet",
      name: "Emmet",
      description: "HTML/CSS abbreviation completions in editor.",
    },
    {
      id: "react-snippets",
      name: "React Snippets",
      description: "Common React component and hook snippets.",
    },
    {
      id: "tailwind-snippets",
      name: "Tailwind CSS Snippets",
      description: "Utility-first className and layout snippets.",
    },
    {
      id: "nextjs-snippets",
      name: "Next.js Snippets",
      description: "Page, layout, route handler, and client directive snippets.",
    },
    {
      id: "typescript-essentials",
      name: "TypeScript Essentials",
      description: "Interfaces, types, enums, and type guard snippets.",
    },
    {
      id: "node-express-snippets",
      name: "Node/Express Snippets",
      description: "Server boilerplate and route snippets.",
    },
    {
      id: "html-css-snippets",
      name: "HTML/CSS Snippets",
      description: "Starter HTML and reusable CSS utility snippets.",
    },
    {
      id: "json-yaml-snippets",
      name: "JSON/YAML Snippets",
      description: "Quick JSON and YAML templates.",
    },
  ];

  // Custom hooks
  const { playgroundData, templateData, isLoading, error, saveTemplateData } =
    usePlayground(id);
  const aiSuggestions = useAISuggestions();
  const {
    activeFileId,
    closeAllFiles,
    openFile,
    closeFile,
    editorContent,
    updateFileContent,
    handleAddFile,
    handleAddFolder,
    handleDeleteFile,
    handleDeleteFolder,
    handleRenameFile,
    handleRenameFolder,
    openFiles,
    setTemplateData,
    setActiveFileId,
    setPlaygroundId,
    setOpenFiles,
  } = useFileExplorer();

  const {
    serverUrl,
    isLoading: containerLoading,
    error: containerError,
    instance,
    writeFileSync,
    // @ts-ignore
  } = useWebContainer({ templateData });

  const lastSyncedContent = useRef<Map<string, string>>(new Map());
  const autoSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const terminalRef = useRef<TerminalRef | null>(null);

  // Set template data when playground loads
  React.useEffect(() => {
    setPlaygroundId(id);
  }, [id, setPlaygroundId]);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem("vibecode.installedExtensions");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setInstalledExtensions(parsed);
        }
      }
    } catch {
      setInstalledExtensions([]);
    }
  }, []);

  const toggleExtension = (extensionId: string) => {
    setInstalledExtensions((current) => {
      const updated = current.includes(extensionId)
        ? current.filter((item) => item !== extensionId)
        : [...current, extensionId];

      window.localStorage.setItem(
        "vibecode.installedExtensions",
        JSON.stringify(updated),
      );

      const extensionName =
        extensionCatalog.find((item) => item.id === extensionId)?.name || extensionId;
      toast.success(
        current.includes(extensionId)
          ? `${extensionName} removed`
          : `${extensionName} installed`,
      );

      return updated;
    });
  };

  const installEssentialExtensions = () => {
    const essentialIds = extensionCatalog.map((extension) => extension.id);
    setInstalledExtensions(essentialIds);
    window.localStorage.setItem(
      "vibecode.installedExtensions",
      JSON.stringify(essentialIds),
    );
    toast.success("Installed essential extension pack");
  };

  // Initialize zustand templateData from usePlayground only on first load
  React.useEffect(() => {
    if (templateData && !openFiles.length) {
      setTemplateData(templateData);
    }
  }, [templateData, setTemplateData, openFiles.length]);

  // Create wrapper functions that pass saveTemplateData
  const wrappedHandleAddFile = useCallback(
    (newFile: TemplateFile, parentPath: string) => {
      return handleAddFile(
        newFile,
        parentPath,
        writeFileSync!,
        instance,
        saveTemplateData,
      );
    },
    [handleAddFile, writeFileSync, instance, saveTemplateData],
  );

  const wrappedHandleAddFolder = useCallback(
    (newFolder: TemplateFolder, parentPath: string) => {
      return handleAddFolder(newFolder, parentPath, instance, saveTemplateData);
    },
    [handleAddFolder, instance, saveTemplateData],
  );

  const wrappedHandleDeleteFile = useCallback(
    (file: TemplateFile, parentPath: string) => {
      return handleDeleteFile(file, parentPath, saveTemplateData);
    },
    [handleDeleteFile, saveTemplateData],
  );

  const wrappedHandleDeleteFolder = useCallback(
    (folder: TemplateFolder, parentPath: string) => {
      return handleDeleteFolder(folder, parentPath, saveTemplateData);
    },
    [handleDeleteFolder, saveTemplateData],
  );

  const wrappedHandleRenameFile = useCallback(
    (
      file: TemplateFile,
      newFilename: string,
      newExtension: string,
      parentPath: string,
    ) => {
      return handleRenameFile(
        file,
        newFilename,
        newExtension,
        parentPath,
        saveTemplateData,
      );
    },
    [handleRenameFile, saveTemplateData],
  );

  const wrappedHandleRenameFolder = useCallback(
    (folder: TemplateFolder, newFolderName: string, parentPath: string) => {
      return handleRenameFolder(
        folder,
        newFolderName,
        parentPath,
        saveTemplateData,
      );
    },
    [handleRenameFolder, saveTemplateData],
  );

  const activeFile = openFiles.find((file) => file.id === activeFileId);
  const hasUnsavedChanges = openFiles.some((file) => file.hasUnsavedChanges);

  const inferLanguageFromExtension = (extension?: string) => {
    switch ((extension || "").toLowerCase()) {
      case "ts":
      case "tsx":
        return "TypeScript";
      case "js":
      case "jsx":
        return "JavaScript";
      case "py":
        return "Python";
      case "java":
        return "Java";
      case "json":
        return "JSON";
      case "html":
        return "HTML";
      case "css":
        return "CSS";
      default:
        return "Text";
    }
  };

  const insertCodeAtPosition = (
    originalContent: string,
    code: string,
    position?: { line: number; column: number },
  ) => {
    if (!position || position.line < 1 || position.column < 1) {
      const separator =
        originalContent.length > 0 && !originalContent.endsWith("\n")
          ? "\n"
          : "";
      return `${originalContent}${separator}${code}`;
    }

    const lines = originalContent.split("\n");
    const lineIndex = Math.min(Math.max(position.line - 1, 0), lines.length - 1);
    const columnIndex = Math.min(
      Math.max(position.column - 1, 0),
      (lines[lineIndex] || "").length,
    );

    lines[lineIndex] =
      (lines[lineIndex] || "").slice(0, columnIndex) +
      code +
      (lines[lineIndex] || "").slice(columnIndex);

    return lines.join("\n");
  };

  const sanitizeAIInsertedCode = (rawCode: string) => {
    const fencedCodeMatch = rawCode.match(/```[a-zA-Z0-9_-]*\n([\s\S]*?)```/);
    if (fencedCodeMatch?.[1]) {
      return fencedCodeMatch[1].trimEnd();
    }
    return rawCode;
  };

  const handleFileSelect = (file: TemplateFile) => {
    openFile(file);
  };

  const resolveOpenFilePath = (
    file: TemplateFile & { id?: string; filePath?: string },
    root: TemplateFolder,
  ) => {
    const explicitPath = file.filePath?.replace(/^\/+/, "");
    if (explicitPath) return explicitPath;

    const idPath = file.id?.replace(/^\/+/, "");
    if (idPath && idPath.includes("/")) return idPath;

    return findFilePath(file, root) || "";
  };

  const updateTemplateFileContentByPath = (
    root: TemplateFolder,
    targetPath: string,
    content: string,
  ) => {
    const normalizedPath = targetPath.replace(/^\/+/, "");
    const segments = normalizedPath.split("/").filter(Boolean);
    if (segments.length === 0) return false;

    const rawFileName = segments[segments.length - 1];
    const parentFolders = segments.slice(0, -1);

    const dotIndex = rawFileName.lastIndexOf(".");
    const filename = dotIndex === -1 ? rawFileName : rawFileName.slice(0, dotIndex);
    const extension = dotIndex === -1 ? "" : rawFileName.slice(dotIndex + 1);

    let currentFolder: TemplateFolder = root;

    for (const folderName of parentFolders) {
      const next = currentFolder.items.find(
        (item): item is TemplateFolder => "folderName" in item && item.folderName === folderName,
      );

      if (!next) return false;
      currentFolder = next;
    }

    const fileItem = currentFolder.items.find(
      (item): item is TemplateFile =>
        "filename" in item &&
        item.filename === filename &&
        (item.fileExtension || "") === extension,
    );

    if (!fileItem) return false;

    fileItem.content = content;
    return true;
  };

  const handleSave = useCallback(
    async (fileId?: string) => {
      const targetFileId = fileId || activeFileId;
      if (!targetFileId) return;

      const fileToSave = openFiles.find((f) => f.id === targetFileId);
      if (!fileToSave) return;

      const latestTemplateData = useFileExplorer.getState().templateData;
      if (!latestTemplateData) return;

      try {
        const filePath = resolveOpenFilePath(fileToSave, latestTemplateData);
        if (!filePath) {
          toast.error(
            `Could not find path for file: ${fileToSave.filename}.${fileToSave.fileExtension}`,
          );
          return;
        }

        // Update file content in template data (clone for immutability)
        const updatedTemplateData = JSON.parse(
          JSON.stringify(latestTemplateData),
        );
        const didUpdate = updateTemplateFileContentByPath(
          updatedTemplateData,
          filePath,
          fileToSave.content,
        );

        if (!didUpdate) {
          toast.error(`Failed to update file at path: ${filePath}`);
          return;
        }

        // Sync with WebContainer
        if (writeFileSync) {
          await writeFileSync(filePath, fileToSave.content);
          lastSyncedContent.current.set(fileToSave.id, fileToSave.content);
          if (instance && instance.fs) {
            await instance.fs.writeFile(filePath, fileToSave.content);
          }
        }

        // Use saveTemplateData to persist changes
        const newTemplateData = await saveTemplateData(updatedTemplateData);
        setTemplateData(newTemplateData || updatedTemplateData);

        // Update open files
        const updatedOpenFiles = openFiles.map((f) =>
          f.id === targetFileId
            ? {
                ...f,
                content: fileToSave.content,
                originalContent: fileToSave.content,
                hasUnsavedChanges: false,
              }
            : f,
        );
        setOpenFiles(updatedOpenFiles);

        toast.success(
          `Saved ${fileToSave.filename}.${fileToSave.fileExtension}`,
        );

        const isPackageJsonFile =
          fileToSave.filename.toLowerCase() === "package" &&
          fileToSave.fileExtension.toLowerCase() === "json";

        if (isPackageJsonFile && instance) {
          toast.info("Installing updated dependencies...");
          const installProcess = await instance.spawn("npm", ["install"]);
          const exitCode = await installProcess.exit;
          if (exitCode === 0) {
            toast.success("Dependencies installed successfully");
          } else {
            toast.error(`Dependency install failed (exit code ${exitCode})`);
          }
        }
      } catch (error) {
        console.error("Error saving file:", error);
        toast.error(
          `Failed to save ${fileToSave.filename}.${fileToSave.fileExtension}`,
        );
        throw error;
      }
    },
    [
      activeFileId,
      openFiles,
      writeFileSync,
      instance,
      saveTemplateData,
      setTemplateData,
      setOpenFiles,
    ],
  );

  const handleSaveAll = async () => {
    const unsavedFiles = openFiles.filter((f) => f.hasUnsavedChanges);

    if (unsavedFiles.length === 0) {
      toast.info("No unsaved changes");
      return;
    }

    try {
      await Promise.all(unsavedFiles.map((f) => handleSave(f.id)));
      toast.success(`Saved ${unsavedFiles.length} file(s)`);
    } catch (error) {
      toast.error("Failed to save some files");
    }
  };

  // Add event to save file by click ctrl + s
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  React.useEffect(() => {
    if (!activeFile || !templateData || !writeFileSync) return;

    const filePath = resolveOpenFilePath(activeFile, templateData);
    if (!filePath) return;

    const lastSynced = lastSyncedContent.current.get(activeFile.id);
    if (lastSynced === activeFile.content) return;

    if (autoSyncTimeoutRef.current) {
      clearTimeout(autoSyncTimeoutRef.current);
    }

    autoSyncTimeoutRef.current = setTimeout(async () => {
      try {
        await writeFileSync(filePath, activeFile.content || "");
        lastSyncedContent.current.set(activeFile.id, activeFile.content || "");
      } catch (syncError) {
        console.error("Auto-sync to WebContainer failed:", syncError);
      }
    }, 350);

    return () => {
      if (autoSyncTimeoutRef.current) {
        clearTimeout(autoSyncTimeoutRef.current);
      }
    };
  }, [activeFile, templateData, writeFileSync]);

  const handleInsertCodeFromAI = useCallback(
    (
      code: string,
      fileName?: string,
      position?: { line: number; column: number },
    ) => {
      if (!openFiles.length) {
        toast.error("Open a file first to insert AI code");
        return;
      }

      const normalizedName = (fileName || "").toLowerCase();
      const matchedFile = normalizedName
        ? openFiles.find(
            (file) =>
              `${file.filename}.${file.fileExtension}`.toLowerCase() ===
                normalizedName || file.filename.toLowerCase() === normalizedName,
          )
        : undefined;

      const targetFile = matchedFile || activeFile || openFiles[0];
      if (!targetFile) {
        toast.error("No target file found for AI insertion");
        return;
      }

      const sanitizedCode = sanitizeAIInsertedCode(code);

      const updatedContent = insertCodeAtPosition(
        targetFile.content || "",
        sanitizedCode,
        position,
      );

      updateFileContent(targetFile.id, updatedContent);
      setActiveFileId(targetFile.id);
      toast.success(`Inserted AI code into ${targetFile.filename}.${targetFile.fileExtension}`);
    },
    [activeFile, openFiles, setActiveFileId, updateFileContent],
  );

  const handleRunCodeFromAI = useCallback(
    async (code: string) => {
      handleInsertCodeFromAI(code);

      if (activeFileId) {
        try {
          await handleSave(activeFileId);
        } catch {
          // Save errors are already handled in handleSave
        }
      }

      toast.info("Code inserted. Preview updates when the project rebuilds.");
    },
    [activeFileId, handleInsertCodeFromAI, handleSave],
  );

  const runPackageCommand = useCallback(
    async (command: string) => {
      if (!instance) {
        toast.error("WebContainer is not ready yet");
        return;
      }

      let normalizedCommand = command.trim();
      if (/^shadcn\s+/i.test(normalizedCommand)) {
        normalizedCommand = normalizedCommand.replace(/^shadcn/i, "npx shadcn@latest");
      }
      if (/^npx\s+shadcn\s+/i.test(normalizedCommand)) {
        normalizedCommand = normalizedCommand.replace(/^npx\s+shadcn/i, "npx shadcn@latest");
      }
      if (/^install\s+/i.test(normalizedCommand)) {
        normalizedCommand = normalizedCommand.replace(/^install\s+/i, "npm install ");
      }

      const parts = normalizedCommand.split(/\s+/).filter(Boolean);
      if (parts.length < 2) {
        toast.error("Use commands like: npm install cors");
        return;
      }

      setIsRunningPackageCommand(true);
      try {
        const [cmd, ...args] = parts;
        const process = await instance.spawn(cmd, args);
        const exitCode = await process.exit;

        if (exitCode !== 0) {
          throw new Error(`Command failed with exit code ${exitCode}`);
        }

        toast.success("Package command completed successfully");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to execute package command";
        toast.error(message);
      } finally {
        setIsRunningPackageCommand(false);
      }
    },
    [instance],
  );

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh)] p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="destructive">
          Try Again
        </Button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh)] p-4">
        <div className="w-full max-w-md p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Loading Playground
          </h2>
          <div className="mb-8">
            <LoadingStep
              currentStep={1}
              step={1}
              label="Loading playground data"
            />
            <LoadingStep
              currentStep={2}
              step={2}
              label="Setting up environment"
            />
            <LoadingStep currentStep={3} step={3} label="Ready to code" />
          </div>
        </div>
      </div>
    );
  }

  // No template data
  if (!templateData) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh)] p-4">
        <FolderOpen className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold text-amber-600 mb-2">
          No template data available
        </h2>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reload Template
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <>
        <div className="h-[calc(100vh)]">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={22} minSize={14} maxSize={35}>
              <TemplateFileTree
                data={templateData}
                onFileSelect={handleFileSelect}
                selectedFile={activeFile}
                title="File Explorer"
                onAddFile={wrappedHandleAddFile}
                onAddFolder={wrappedHandleAddFolder}
                onDeleteFile={wrappedHandleDeleteFile}
                onDeleteFolder={wrappedHandleDeleteFolder}
                onRenameFile={wrappedHandleRenameFile}
                onRenameFolder={wrappedHandleRenameFolder}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={78} minSize={45}>
              <div className="h-full flex flex-col">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                  <div className="flex flex-1 items-center gap-2">
                    <div className="flex flex-col flex-1">
                      <h1 className="text-sm font-medium">
                        {playgroundData?.name || "Code Playground"}
                      </h1>
                      <p className="text-xs text-muted-foreground">
                        {openFiles.length} file(s) open
                        {hasUnsavedChanges && " • Unsaved changes"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSave()}
                            disabled={!activeFile || !activeFile.hasUnsavedChanges}>
                            <Save className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Save (Ctrl+S)</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSaveAll}
                            disabled={!hasUnsavedChanges}>
                            <Save className="h-4 w-4" /> All
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Save All (Ctrl+Shift+S)</TooltipContent>
                      </Tooltip>

                      <ToggleAI
                        isEnabled={aiSuggestions.isEnabled}
                        onToggle={aiSuggestions.toggleEnabled}
                        suggestionLoading={aiSuggestions.isLoading}
                        activeFile={
                          activeFile
                            ? {
                                name: `${activeFile.filename}.${activeFile.fileExtension}`,
                                content: activeFile.content || "",
                                language: inferLanguageFromExtension(
                                  activeFile.fileExtension,
                                ),
                              }
                            : undefined
                        }
                        cursorPosition={aiSuggestions.position || { line: 1, column: 1 }}
                        onInsertCode={handleInsertCodeFromAI}
                        onRunCode={handleRunCodeFromAI}
                      />

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsPackageDialogOpen(true)}
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Install Package
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Run npm/pnpm/yarn install commands</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsExtensionsDialogOpen(true)}
                          >
                            <Blocks className="h-4 w-4 mr-2" />
                            Extensions
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Install editor extensions</TooltipContent>
                      </Tooltip>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setIsPreviewVisible(!isPreviewVisible)}>
                            {isPreviewVisible ? "Hide" : "Show"} Output
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={closeAllFiles}>
                            Close All Files
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <UserButton />
                    </div>
                  </div>
                </header>

                <div className="flex-1 min-h-0 flex flex-col">
                  {openFiles.length > 0 && (
                    <div className="border-b bg-muted/30">
                      <Tabs
                        value={activeFileId || ""}
                        onValueChange={setActiveFileId}>
                        <div className="flex items-center justify-between px-4 py-2">
                          <TabsList className="h-8 bg-transparent p-0">
                            {openFiles.map((file) => (
                              <TabsTrigger
                                key={file.id}
                                value={file.id}
                                className="relative h-8 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm group">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-3 w-3" />
                                  <span>
                                    {file.filename}.{file.fileExtension}
                                  </span>
                                  {file.hasUnsavedChanges && (
                                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                                  )}
                                  <span
                                    className="ml-2 h-4 w-4 hover:bg-destructive hover:text-destructive-foreground rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      closeFile(file.id);
                                    }}>
                                    <X className="h-3 w-3" />
                                  </span>
                                </div>
                              </TabsTrigger>
                            ))}
                          </TabsList>

                          {openFiles.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={closeAllFiles}
                              className="h-6 px-2 text-xs">
                              Close All
                            </Button>
                          )}
                        </div>
                      </Tabs>
                    </div>
                  )}

                  <div className="flex-1 min-h-0">
                    <ResizablePanelGroup direction="vertical" className="h-full">
                      <ResizablePanel defaultSize={70} minSize={35}>
                        <ResizablePanelGroup direction="horizontal" className="h-full">
                          <ResizablePanel defaultSize={isPreviewVisible ? 60 : 100} minSize={35}>
                            {activeFile ? (
                              <PlaygroundEditor
                                activeFile={activeFile}
                                content={activeFile?.content || ""}
                                installedExtensions={installedExtensions}
                                onContentChange={(value) =>
                                  activeFileId && updateFileContent(activeFileId, value)
                                }
                                suggestion={aiSuggestions.suggestion}
                                suggestionLoading={aiSuggestions.isLoading}
                                suggestionPosition={aiSuggestions.position}
                                onAcceptSuggestion={(editor, monaco) =>
                                  aiSuggestions.acceptSuggestion(editor, monaco)
                                }
                                onRejectSuggestion={(editor) =>
                                  aiSuggestions.rejectSuggestion(editor)
                                }
                                onTriggerSuggestion={(type, editor) =>
                                  aiSuggestions.fetchSuggestion(type, editor)
                                }
                              />
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
                                <FileText className="h-16 w-16 text-gray-300" />
                                <div className="text-center">
                                  <p className="text-lg font-medium">No files open</p>
                                  <p className="text-sm text-gray-500">
                                    Output is ready. Select a file from the sidebar to start editing.
                                  </p>
                                </div>
                              </div>
                            )}
                          </ResizablePanel>

                          {isPreviewVisible && (
                            <>
                              <ResizableHandle withHandle />
                              <ResizablePanel defaultSize={40} minSize={20}>
                                <WebContainerPreview
                                  templateData={templateData}
                                  instance={instance}
                                  writeFileSync={writeFileSync}
                                  isLoading={containerLoading}
                                  error={containerError}
                                  serverUrl={serverUrl!}
                                  forceResetup={false}
                                  showTerminal={false}
                                  terminalRef={terminalRef}
                                />
                              </ResizablePanel>
                            </>
                          )}
                        </ResizablePanelGroup>
                      </ResizablePanel>

                      <ResizableHandle withHandle />

                      <ResizablePanel defaultSize={30} minSize={15}>
                        <div className="h-full p-2">
                          <TerminalComponent
                            ref={terminalRef}
                            webContainerInstance={instance}
                            theme="dark"
                            className="h-full"
                          />
                        </div>
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        <ConfirmationDialog
          isOpen={confirmationDialog.isOpen}
          title={confirmationDialog.title}
          description={confirmationDialog.description}
          onConfirm={confirmationDialog.onConfirm}
          onCancel={confirmationDialog.onCancel}
          setIsOpen={(open) =>
            setConfirmationDialog((prev) => ({ ...prev, isOpen: open }))
          }
        />

        <Dialog open={isPackageDialogOpen} onOpenChange={setIsPackageDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Install package while coding</DialogTitle>
              <DialogDescription>
                Run commands like <span className="font-mono">npm install cors</span> in the active WebContainer.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <Input
                value={packageCommand}
                onChange={(event) => setPackageCommand(event.target.value)}
                placeholder="npm install cors"
              />

              <div className="flex flex-wrap gap-2">
                {[
                  "npm install cors",
                  "npm install axios",
                  "npm install zod",
                  "npm install dotenv",
                ].map((command) => (
                  <Button
                    key={command}
                    variant="outline"
                    size="sm"
                    onClick={() => setPackageCommand(command)}
                    className="text-xs"
                  >
                    {command}
                  </Button>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPackageDialogOpen(false)} disabled={isRunningPackageCommand}>
                Cancel
              </Button>
              <Button
                onClick={() => runPackageCommand(packageCommand)}
                disabled={isRunningPackageCommand || !packageCommand.trim()}
              >
                {isRunningPackageCommand ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Run Command
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isExtensionsDialogOpen} onOpenChange={setIsExtensionsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Install Editor Extensions</DialogTitle>
              <DialogDescription>
                Enable extensions for this web IDE editor.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              {extensionCatalog.map((extension) => {
                const isInstalled = installedExtensions.includes(extension.id);
                return (
                  <div
                    key={extension.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <p className="font-medium text-sm">{extension.name}</p>
                      <p className="text-xs text-muted-foreground">{extension.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={isInstalled ? "secondary" : "outline"}
                      onClick={() => toggleExtension(extension.id)}
                    >
                      {isInstalled ? "Installed" : "Install"}
                    </Button>
                  </div>
                );
              })}
            </div>

            <DialogFooter>
              <Button variant="secondary" onClick={installEssentialExtensions}>
                Install Essentials
              </Button>
              <Button variant="outline" onClick={() => setIsExtensionsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    </TooltipProvider>
  );
};

export default MainPlaygroundPage;
