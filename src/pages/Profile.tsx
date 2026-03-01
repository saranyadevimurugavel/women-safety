import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { LogOut, Plus, Trash2, UserCircle, Phone } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import type { Tables } from "@/integrations/supabase/types";

const Profile = () => {
  const { user, signOut } = useAuth();
  const [contacts, setContacts] = useState<Tables<"emergency_contacts">[]>([]);
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [newContact, setNewContact] = useState({ name: "", phone: "", relationship: "" });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => setProfile(data));
    loadContacts();
  }, [user]);

  const loadContacts = async () => {
    if (!user) return;
    const { data } = await supabase.from("emergency_contacts").select("*").eq("user_id", user.id).order("created_at");
    setContacts(data || []);
  };

  const addContact = async () => {
    if (!newContact.name || !newContact.phone) {
      toast.error("Name and phone are required");
      return;
    }
    if (contacts.length >= 3) {
      toast.error("Maximum 3 emergency contacts allowed");
      return;
    }
    const { error } = await supabase.from("emergency_contacts").insert({
      user_id: user!.id,
      name: newContact.name,
      phone: newContact.phone,
      relationship: newContact.relationship || null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Contact added");
    setNewContact({ name: "", phone: "", relationship: "" });
    setShowForm(false);
    loadContacts();
  };

  const deleteContact = async (id: string) => {
    await supabase.from("emergency_contacts").delete().eq("id", id);
    toast.success("Contact removed");
    loadContacts();
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
  };

  return (
    <AppLayout>
      <header className="pt-8 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      </header>

      {/* User info */}
      <Card className="mb-6 border-none shadow-md">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <UserCircle className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{profile?.full_name || "User"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card className="mb-6 border-none shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Emergency Contacts</CardTitle>
          {contacts.length < 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(!showForm)}
              className="text-primary"
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {showForm && (
            <div className="space-y-3 rounded-xl bg-muted/50 p-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Contact name"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="space-y-2">
                <Label>Relationship (optional)</Label>
                <Input
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  placeholder="e.g. Mother, Friend"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addContact} size="sm">Save</Button>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {contacts.length === 0 && !showForm ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No emergency contacts added yet
            </p>
          ) : (
            contacts.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                  <Phone className="h-4 w-4 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.phone}{c.relationship ? ` · ${c.relationship}` : ""}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteContact(c.id)} className="shrink-0 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}

          <p className="text-xs text-muted-foreground text-center">
            {contacts.length}/3 contacts
          </p>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full" onClick={handleSignOut}>
        <LogOut className="h-4 w-4 mr-2" /> Sign Out
      </Button>
    </AppLayout>
  );
};

export default Profile;
