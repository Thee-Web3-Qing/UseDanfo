import { Navbar } from "@/components/layout/Navbar";
import { useGetStats, getGetStatsQueryKey, useGetRoutes, getGetRoutesQueryKey, useGetAreas, getGetAreasQueryKey, useGetBadges, getGetBadgesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, Activity, RefreshCw, Trophy } from "lucide-react";

export function Admin() {
  const { data: stats } = useGetStats({ query: { queryKey: getGetStatsQueryKey() } });
  const { data: areas } = useGetAreas({ query: { queryKey: getGetAreasQueryKey() } });
  const { data: routes } = useGetRoutes({ query: { queryKey: getGetRoutesQueryKey() } });
  const { data: badges } = useGetBadges({ query: { queryKey: getGetBadgesQueryKey() } });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-4xl font-display mb-2 text-primary">Data Engine</h1>
          <p className="text-muted-foreground text-lg">The community-sourced dataset powering DanfoGPT's routing intelligence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Routes Indexed</CardTitle>
              <Database className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display">{stats?.total_routes || "---"}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Contributors</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display">{stats?.total_contributors || "---"}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Network Nodes</CardTitle>
              <RefreshCw className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display">{areas?.length || "---"}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Badges Available</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display">{badges?.length || "---"}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Raw Route Data</CardTitle>
            <CardDescription>Recent contributions shaping the routing graph.</CardDescription>
          </CardHeader>
          <CardContent>
            {routes && routes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead>Start Area</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Legs</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Difficulty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.map((route) => (
                    <TableRow key={route.id} className="border-border/50">
                      <TableCell className="font-medium">{route.start_area_name || `Area #${route.start_area_id}`}</TableCell>
                      <TableCell>{route.end_area_name || `Area #${route.end_area_id}`}</TableCell>
                      <TableCell>{route.legs?.length || 0} transfer(s)</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs uppercase bg-secondary/50">
                          {route.confidence_level.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs uppercase border-primary/20 text-primary">
                          {route.difficulty_level.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No routes indexed for the current session.</p>
                <p className="text-sm mt-1">Connect the admin data stream to view raw contributions.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
