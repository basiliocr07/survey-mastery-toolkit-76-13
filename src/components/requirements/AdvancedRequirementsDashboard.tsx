
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardList, 
  BarChart, 
  CheckCircle, 
  Clock,
  FileText,
  Lightbulb
} from 'lucide-react';
import { Requirement } from '@/types/requirements';
import AdvancedRequirementsList from './AdvancedRequirementsList';
import AdvancedRequirementForm from './AdvancedRequirementForm';
import AdvancedRequirementReports from './AdvancedRequirementReports';

interface AdvancedRequirementsDashboardProps {
  isAdmin: boolean;
  requirements: Requirement[];
  totalCount?: number;
  proposedCount?: number;
  inProgressCount?: number;
  implementedCount?: number;
}

export default function AdvancedRequirementsDashboard({ 
  isAdmin = false, 
  requirements = [],
  totalCount = 0,
  proposedCount = 0,
  inProgressCount = 0,
  implementedCount = 0
}: AdvancedRequirementsDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>(isAdmin ? 'view' : 'submit');

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center pt-6">
              <div className="rounded-full bg-primary/10 p-3 mb-3">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">{totalCount}</div>
              <p className="text-sm text-muted-foreground">Total Requirements</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center pt-6">
              <div className="rounded-full bg-blue-100 p-3 mb-3">
                <Lightbulb className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{proposedCount}</div>
              <p className="text-sm text-muted-foreground">Proposed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center pt-6">
              <div className="rounded-full bg-yellow-100 p-3 mb-3">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold">{inProgressCount}</div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center pt-6">
              <div className="rounded-full bg-green-100 p-3 mb-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-2xl font-bold">{implementedCount}</div>
              <p className="text-sm text-muted-foreground">Implemented</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="view">View Requirements</TabsTrigger>
          <TabsTrigger value="submit">Submit Requirement</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="space-y-6">
          <AdvancedRequirementsList requirements={requirements} isAdmin={isAdmin} />
        </TabsContent>
        
        <TabsContent value="submit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                New Requirement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdvancedRequirementForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <AdvancedRequirementReports requirements={requirements} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
