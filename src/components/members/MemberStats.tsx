import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, BookOpen, AlertCircle } from "lucide-react";
import { Member } from "@/lib/types";

interface MemberStatsProps {
  members: Member[];
  totalBorrowed: number;
  overdueCount: number;
}

const MemberStats = ({ members, totalBorrowed, overdueCount }: MemberStatsProps) => {
  const activeMembers = members.filter((m) => m.status === "Active").length;

  const stats = [
    {
      title: "Total Members",
      value: members.length,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Members",
      value: activeMembers,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Books Borrowed",
      value: totalBorrowed,
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Overdue Books",
      value: overdueCount,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MemberStats;
