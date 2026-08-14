"use client";

import { useState } from "react";
import { Plus, Scissors, MoreVertical, Pencil, Layers, Power, Trash2 } from "lucide-react";
import {
  useServices,
  useServiceCategories,
  useCreateServiceCategory,
  useDeleteService,
  useUpdateService,
} from "@/hooks/useServices";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { PageLoading } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ServiceForm } from "./ServiceForm";
import { ServiceVariantManager } from "./ServiceVariantManager";
import { formatCurrency } from "@/utils/format";
import { formatDuration } from "@/utils/date";
import type { ServicesViewProps } from "@/types/props";
import type { Service, ServiceCategory } from "@/types/database";

export function ServicesView({ role }: ServicesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [variantService, setVariantService] = useState<Service | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [catName, setCatName] = useState("");
  const [catParent, setCatParent] = useState("");

  const { data: servicesRaw, isLoading } = useServices(selectedCategory);
  const services = (servicesRaw ?? []) as Service[];
  const { data: categoriesRaw } = useServiceCategories();
  const categories = (categoriesRaw ?? []) as ServiceCategory[];
  const createCategory = useCreateServiceCategory();
  const deleteService = useDeleteService();
  const updateService = useUpdateService();

  const isAdmin = role === "admin";

  const handleCreateCategory = () => {
    if (!catName.trim()) return;
    createCategory.mutate(
      { name: catName.trim(), parent_id: catParent || null, is_active: true },
      {
        onSuccess: () => {
          setCatName("");
          setCatParent("");
          setShowCategoryForm(false);
        },
      },
    );
  };

  const toggleActive = (service: Service) => {
    if (service.is_active) deleteService.mutate(service.id);
    else updateService.mutate({ id: service.id, is_active: true });
  };

  if (isLoading) return <PageLoading />;

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Manage your service catalog"
        action={
          isAdmin ? (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowCategoryForm(true)}>
                <Layers className="h-4 w-4 mr-1" /> Category
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setEditService(null);
                  setShowServiceForm(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Service
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(undefined)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${!selectedCategory ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={<Scissors className="h-12 w-12" />}
          title="No services found"
          description="No services have been added yet."
          action={
            isAdmin ? (
              <Button
                onClick={() => {
                  setEditService(null);
                  setShowServiceForm(true);
                }}
              >
                Add Service
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className={!service.is_active ? "opacity-60" : ""}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{service.name}</h3>
                    {service.category_id && categoryMap.get(service.category_id) && (
                      <p className="text-xs text-muted-foreground">{categoryMap.get(service.category_id)!.name}</p>
                    )}
                    {service.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!service.is_active && (
                      <Badge variant="secondary" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-none">
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditService(service);
                                setShowServiceForm(true);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setVariantService(service)}>
                              <Layers className="mr-2 h-4 w-4" /> Variants
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleActive(service)}>
                              {service.is_active ? (
                                <Trash2 className="mr-2 h-4 w-4" />
                              ) : (
                                <Power className="mr-2 h-4 w-4" />
                              )}
                              {service.is_active ? "Disable" : "Enable"}
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-bold text-primary">{formatCurrency(service.base_price)}</span>
                  <span className="text-xs text-muted-foreground">{formatDuration(service.duration_mins)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Service */}
      <Dialog open={showServiceForm} onOpenChange={setShowServiceForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editService ? "Edit Service" : "Add Service"}</DialogTitle>
          </DialogHeader>
          <ServiceForm
            service={editService ?? undefined}
            categories={categories}
            onSuccess={() => setShowServiceForm(false)}
            onCancel={() => setShowServiceForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Variants */}
      <Dialog open={!!variantService} onOpenChange={(o) => !o && setVariantService(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Variants — {variantService?.name}</DialogTitle>
          </DialogHeader>
          {variantService && <ServiceVariantManager serviceId={variantService.id} />}
        </DialogContent>
      </Dialog>

      {/* Category */}
      <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="e.g. Facials" />
            </div>
            <div className="space-y-1.5">
              <Label>Parent category (optional — for subcategory)</Label>
              <Select
                value={catParent || undefined}
                items={Object.fromEntries(categories.filter((c) => !c.parent_id).map((c) => [c.id, c.name]))}
                onValueChange={(v: unknown) => setCatParent(v ? String(v) : "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (top-level)" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((c) => !c.parent_id)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCategoryForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCategory} disabled={createCategory.isPending || !catName.trim()}>
                {createCategory.isPending ? "Saving..." : "Create Category"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
