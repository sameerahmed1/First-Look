"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { signOut } from "@/app/actions/auth";
import {
  createUploadLink,
  deleteUploadLink,
} from "@/app/actions/upload-links";
import { deleteProject, updateProjectStatus } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LogOut,
  Plus,
  Link as LinkIcon,
  Copy,
  Trash2,
  ExternalLink,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Image as ImageIcon,
  Video,
} from "lucide-react";

interface PricingScenario {
  label: "Best Case" | "Most Likely" | "Worst Case";
  price: string;
  description: string;
}

interface Project {
  id: string;
  customer_name: string;
  project_name: string;
  status: string;
  created_at: string;
  project_media: Array<{
    id: string;
    file_url: string;
    file_type: string;
  }>;
  project_analysis: Array<{
    id: string;
    damage_type: string;
    severity_score: number;
    trade_category?: string;
    scenarios?: PricingScenario[];
    variables?: string[];
    summary: string;
    // Legacy fields for backward compatibility
    cost_estimate_min?: number;
    cost_estimate_max?: number;
    cost_reasoning?: string;
  }>;
}

interface UploadLink {
  id: string;
  token: string;
  label: string | null;
  created_at: string;
}

interface DashboardClientProps {
  user: User;
  projects: Project[];
  uploadLinks: UploadLink[];
}

export function DashboardClient({
  user,
  projects,
  uploadLinks,
}: DashboardClientProps) {
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [linkLabel, setLinkLabel] = useState("");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleCreateLink = async () => {
    setIsCreatingLink(true);
    await createUploadLink(linkLabel || undefined);
    setLinkLabel("");
    setIsCreatingLink(false);
  };

  const handleCopyLink = async (token: string) => {
    const url = `${window.location.origin}/upload/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedLink(token);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleDeleteLink = async (linkId: string) => {
    if (confirm("Are you sure you want to delete this upload link?")) {
      await deleteUploadLink(linkId);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteProject(projectId);
      setSelectedProject(null);
    }
  };

  const handleStatusChange = async (
    projectId: string,
    status: "pending" | "analyzed" | "quoted" | "completed"
  ) => {
    await updateProjectStatus(projectId, status);
  };

  const getSeverityColor = (score: number) => {
    if (score <= 3) return "text-green-600";
    if (score <= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "analyzed":
        return <FileText className="w-4 h-4 text-blue-500" />;
      case "quoted":
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">First Look</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <form action={signOut}>
            <Button variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Upload Links Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  Upload Links
                </CardTitle>
                <CardDescription>
                  Create links to share with customers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Create New Link */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Label (optional)"
                    value={linkLabel}
                    onChange={(e) => setLinkLabel(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md bg-background text-sm"
                  />
                  <Button
                    onClick={handleCreateLink}
                    disabled={isCreatingLink}
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Links List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {uploadLinks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No upload links yet
                    </p>
                  ) : (
                    uploadLinks.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between p-2 rounded-md bg-muted"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {link.label || "Unnamed link"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(link.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyLink(link.token)}
                          >
                            {copiedLink === link.token ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.open(`/upload/${link.token}`, "_blank")
                            }
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLink(link.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>
                  Customer uploads and AI assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No projects yet</p>
                    <p className="text-sm">
                      Share an upload link with a customer to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedProject?.id === project.id
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() =>
                          setSelectedProject(
                            selectedProject?.id === project.id ? null : project
                          )
                        }
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(project.status)}
                              <h3 className="font-semibold">
                                {project.project_name}
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {project.customer_name} &bull;{" "}
                              {new Date(project.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {project.project_media.length > 0 && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                {project.project_media.some(
                                  (m) => m.file_type === "video"
                                ) ? (
                                  <Video className="w-3 h-3" />
                                ) : (
                                  <ImageIcon className="w-3 h-3" />
                                )}
                                {project.project_media.length}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Expanded View */}
                        {selectedProject?.id === project.id && (
                          <div className="mt-4 pt-4 border-t space-y-4">
                            {/* Media Preview */}
                            {project.project_media.length > 0 && (
                              <div className="flex gap-2 overflow-x-auto pb-2">
                                {project.project_media.map((media) => (
                                  <div
                                    key={media.id}
                                    className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted"
                                  >
                                    {media.file_type === "video" ? (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Video className="w-8 h-8 text-muted-foreground" />
                                      </div>
                                    ) : (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={media.file_url}
                                        alt="Project media"
                                        className="w-full h-full object-cover"
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Analysis */}
                            {project.project_analysis[0] && (
                              <div className="space-y-3">
                                <div className="grid gap-3 sm:grid-cols-3">
                                  <div className="p-3 rounded-md bg-muted">
                                    <p className="text-xs text-muted-foreground mb-1">
                                      Damage Type
                                    </p>
                                    <p className="text-sm font-medium">
                                      {project.project_analysis[0].damage_type}
                                    </p>
                                  </div>
                                  <div className="p-3 rounded-md bg-muted">
                                    <p className="text-xs text-muted-foreground mb-1">
                                      Severity
                                    </p>
                                    <p
                                      className={`text-sm font-medium ${getSeverityColor(project.project_analysis[0].severity_score)}`}
                                    >
                                      {project.project_analysis[0].severity_score}{" "}
                                      / 10
                                    </p>
                                  </div>
                                  {project.project_analysis[0].trade_category && (
                                    <div className="p-3 rounded-md bg-muted">
                                      <p className="text-xs text-muted-foreground mb-1">
                                        Trade Category
                                      </p>
                                      <p className="text-sm font-medium">
                                        {project.project_analysis[0].trade_category.replace(
                                          /_/g,
                                          " "
                                        )}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Scenario-Based Pricing */}
                                {project.project_analysis[0].scenarios &&
                                project.project_analysis[0].scenarios.length ===
                                  3 ? (
                                  <>
                                    <div className="grid gap-3 sm:grid-cols-3">
                                      {/* Best Case - Green */}
                                      <div className="p-4 rounded-lg border-2 border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
                                        <div className="flex items-center gap-2 mb-2">
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                          <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                                            {
                                              project.project_analysis[0]
                                                .scenarios[0].label
                                            }
                                          </p>
                                        </div>
                                        <p className="text-lg font-bold text-green-900 dark:text-green-300 mb-2">
                                          {
                                            project.project_analysis[0]
                                              .scenarios[0].price
                                          }
                                        </p>
                                        <p className="text-xs text-green-700 dark:text-green-400">
                                          {
                                            project.project_analysis[0]
                                              .scenarios[0].description
                                          }
                                        </p>
                                      </div>

                                      {/* Most Likely - Blue (Highlighted) */}
                                      <div className="p-4 rounded-lg border-2 border-blue-300 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-700 shadow-md">
                                        <div className="flex items-center gap-2 mb-2">
                                          <AlertTriangle className="w-4 h-4 text-blue-600" />
                                          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                                            {
                                              project.project_analysis[0]
                                                .scenarios[1].label
                                            }
                                          </p>
                                        </div>
                                        <p className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-2">
                                          {
                                            project.project_analysis[0]
                                              .scenarios[1].price
                                          }
                                        </p>
                                        <p className="text-xs text-blue-700 dark:text-blue-400">
                                          {
                                            project.project_analysis[0]
                                              .scenarios[1].description
                                          }
                                        </p>
                                      </div>

                                      {/* Worst Case - Red */}
                                      <div className="p-4 rounded-lg border-2 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                                        <div className="flex items-center gap-2 mb-2">
                                          <AlertTriangle className="w-4 h-4 text-red-600" />
                                          <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                                            {
                                              project.project_analysis[0]
                                                .scenarios[2].label
                                            }
                                          </p>
                                        </div>
                                        <p className="text-lg font-bold text-red-900 dark:text-red-300 mb-2">
                                          {
                                            project.project_analysis[0]
                                              .scenarios[2].price
                                          }
                                        </p>
                                        <p className="text-xs text-red-700 dark:text-red-400">
                                          {
                                            project.project_analysis[0]
                                              .scenarios[2].description
                                          }
                                        </p>
                                      </div>
                                    </div>

                                    {/* Cost Variables */}
                                    {project.project_analysis[0].variables &&
                                      project.project_analysis[0].variables
                                        .length > 0 && (
                                        <div className="p-3 rounded-md bg-muted">
                                          <p className="text-xs text-muted-foreground mb-2">
                                            Cost Variables
                                          </p>
                                          <div className="flex flex-wrap gap-1">
                                            {project.project_analysis[0].variables.map(
                                              (variable, idx) => (
                                                <span
                                                  key={idx}
                                                  className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                                                >
                                                  {variable}
                                                </span>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    {/* Pricing Disclaimer */}
                                    <div className="p-3 rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                                      <p className="text-xs text-amber-800 dark:text-amber-400">
                                        <strong>Note:</strong> Estimates
                                        sourced from 2026 National Averages.
                                        Final quote requires site visit.
                                      </p>
                                    </div>
                                  </>
                                ) : (
                                  // Legacy display for old analyses
                                  <div className="p-3 rounded-md bg-muted">
                                    <p className="text-xs text-muted-foreground mb-1">
                                      Cost Estimate
                                    </p>
                                    <p className="text-lg font-bold text-primary">
                                      {project.project_analysis[0]
                                        .cost_estimate_min &&
                                        formatCurrency(
                                          project.project_analysis[0]
                                            .cost_estimate_min
                                        )}{" "}
                                      -{" "}
                                      {project.project_analysis[0]
                                        .cost_estimate_max &&
                                        formatCurrency(
                                          project.project_analysis[0]
                                            .cost_estimate_max
                                        )}
                                    </p>
                                    {project.project_analysis[0]
                                      .cost_reasoning && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {
                                          project.project_analysis[0]
                                            .cost_reasoning
                                        }
                                      </p>
                                    )}
                                  </div>
                                )}

                                <div className="p-3 rounded-md border bg-card">
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Summary
                                  </p>
                                  <p className="text-sm">
                                    {project.project_analysis[0].summary}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 pt-2">
                              <select
                                value={project.status}
                                onChange={(e) =>
                                  handleStatusChange(
                                    project.id,
                                    e.target.value as
                                      | "pending"
                                      | "analyzed"
                                      | "quoted"
                                      | "completed"
                                  )
                                }
                                className="px-3 py-1.5 text-sm border rounded-md bg-background"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option value="pending">Pending</option>
                                <option value="analyzed">Analyzed</option>
                                <option value="quoted">Quoted</option>
                                <option value="completed">Completed</option>
                              </select>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProject(project.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
