'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { deleteUserData } from '@/services/user-service';
import type { UserProfile } from '@/types/user';
import { Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserForm } from '../../users/_components/user-form';
import type { GroupedUsers } from '../page';
import { Badge } from '@/components/ui/badge';

interface RoleListProps {
  groupedUsers: GroupedUsers;
  allRoles: string[];
}

export function RoleList({ groupedUsers, allRoles }: RoleListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };
  
  const openDeleteDialog = (user: UserProfile) => {
    setUserToDelete(user);
    setIsAlertOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    const result = await deleteUserData(userToDelete.uid);
    if (result.success) {
      toast({ title: 'Success', description: result.message });
      router.refresh(); // Reloads data on the page
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsAlertOpen(false);
    setUserToDelete(null);
  };
  
  const sortedRoles = Object.keys(groupedUsers).sort((a, b) => a.localeCompare(b));

  return (
    <>
      <UserForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        user={selectedUser}
        allRoles={allRoles}
      />
      <Accordion type="multiple" className="w-full">
        {sortedRoles.map((role) => (
          <AccordionItem value={role} key={role}>
            <AccordionTrigger>
              <div className="flex items-center gap-4">
                <span className="font-semibold">{role}</span>
                <Badge variant={groupedUsers[role].length > 0 ? "default" : "secondary"}>{groupedUsers[role].length} Pengguna</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {groupedUsers[role].length > 0 ? (
                <ul className="space-y-2 pl-4">
                  {groupedUsers[role].map((user) => (
                    <li key={user.uid} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit User</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => openDeleteDialog(user)}>
                          <Trash2 className="h-4 w-4" />
                           <span className="sr-only">Delete User</span>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground px-4 py-2">Tidak ada pengguna yang ditugaskan untuk peran ini.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user's data for <strong>{userToDelete?.fullName}</strong> from Firestore. It will not remove them from Firebase Authentication.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
