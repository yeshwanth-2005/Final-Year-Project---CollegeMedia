import { useState } from "react";
import { motion } from "framer-motion";
import { Search, BookOpen, Code, Database, Smartphone, Globe, Zap, Target, Clock, Users, Star, Play, Download } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for study materials
const techStacks = [
  {
    id: "web-dev",
    name: "Web Development",
    icon: Globe,
    color: "from-blue-500 to-purple-600",
    description: "Master modern web development with React, Node.js, and more",
    courses: 24,
    duration: "6-8 months",
    difficulty: "Beginner to Advanced"
  },
  {
    id: "mobile-dev",
    name: "Mobile Development",
    icon: Smartphone,
    color: "from-green-500 to-teal-600",
    description: "Build iOS and Android apps with React Native and Flutter",
    courses: 18,
    duration: "5-7 months",
    difficulty: "Intermediate to Advanced"
  },
  {
    id: "data-science",
    name: "Data Science",
    icon: Database,
    color: "from-orange-500 to-red-600",
    description: "Learn Python, ML, and data analysis techniques",
    courses: 32,
    duration: "8-10 months",
    difficulty: "Intermediate to Advanced"
  },
  {
    id: "ai-ml",
    name: "AI & Machine Learning",
    icon: Zap,
    color: "from-purple-500 to-pink-600",
    description: "Explore artificial intelligence and machine learning",
    courses: 28,
    duration: "7-9 months",
    difficulty: "Advanced"
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    icon: Target,
    color: "from-red-500 to-orange-600",
    description: "Learn ethical hacking and security best practices",
    courses: 20,
    duration: "6-8 months",
    difficulty: "Intermediate to Advanced"
  },
  {
    id: "devops",
    name: "DevOps & Cloud",
    icon: Code,
    color: "from-indigo-500 to-blue-600",
    description: "Master CI/CD, Docker, Kubernetes, and cloud platforms",
    courses: 22,
    duration: "5-7 months",
    difficulty: "Intermediate to Advanced"
  }
];

const learningPaths = [
  {
    id: "frontend",
    title: "Frontend Developer Path",
    description: "Complete path to become a frontend developer",
    duration: "6 months",
    level: "Beginner",
    courses: [
      { name: "HTML & CSS Fundamentals", duration: "2 weeks", rating: 4.8 },
      { name: "JavaScript ES6+", duration: "3 weeks", rating: 4.9 },
      { name: "React.js Mastery", duration: "4 weeks", rating: 4.7 },
      { name: "Advanced CSS & Responsive Design", duration: "2 weeks", rating: 4.6 },
      { name: "State Management with Redux", duration: "3 weeks", rating: 4.5 }
    ]
  },
  {
    id: "fullstack",
    title: "Full Stack Developer Path",
    description: "End-to-end web development skills",
    duration: "10 months",
    level: "Intermediate",
    courses: [
      { name: "Frontend Fundamentals", duration: "3 weeks", rating: 4.8 },
      { name: "Node.js & Express.js", duration: "4 weeks", rating: 4.7 },
      { name: "Database Design & SQL", duration: "3 weeks", rating: 4.6 },
      { name: "API Development", duration: "2 weeks", rating: 4.8 },
      { name: "Authentication & Security", duration: "2 weeks", rating: 4.5 },
      { name: "Deployment & DevOps Basics", duration: "2 weeks", rating: 4.4 }
    ]
  },
  {
    id: "mobile",
    title: "Mobile App Developer Path",
    description: "Cross-platform mobile development",
    duration: "8 months",
    level: "Intermediate",
    courses: [
      { name: "React Native Basics", duration: "3 weeks", rating: 4.7 },
      { name: "Mobile UI/UX Design", duration: "2 weeks", rating: 4.6 },
      { name: "State Management", duration: "2 weeks", rating: 4.8 },
      { name: "Native Modules & APIs", duration: "3 weeks", rating: 4.5 },
      { name: "Testing & Debugging", duration: "2 weeks", rating: 4.4 },
      { name: "App Store Deployment", duration: "1 week", rating: 4.6 }
    ]
  }
];

const StudyMaterials = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStack, setSelectedStack] = useState("all");

  const filteredStacks = techStacks.filter(stack =>
    stack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stack.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold gradient-text mb-2">Study Materials</h1>
          <p className="text-muted-foreground">
            Choose your learning path and master the skills you need
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for tech stacks, courses, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg bg-card/50 border-border/30 focus:bg-card focus:border-primary/50 transition-all duration-300 rounded-xl"
            />
          </div>
        </motion.div>

        {/* Tech Stacks Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold mb-6">Popular Tech Stacks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStacks.map((stack, index) => (
              <motion.div
                key={stack.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 hover:bg-card cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stack.color} flex items-center justify-center`}>
                        <stack.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{stack.name}</h3>
                        <p className="text-sm text-muted-foreground">{stack.difficulty}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{stack.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Courses:</span>
                      <span className="font-medium">{stack.courses}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{stack.duration}</span>
                    </div>
                    
                    <Button variant="gradient" className="w-full">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Start Learning
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Learning Paths */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold mb-6">Structured Learning Paths</h2>
          <Tabs defaultValue="frontend" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6">
              {learningPaths.map((path) => (
                <TabsTrigger key={path.id} value={path.id} className="text-sm">
                  {path.title.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {learningPaths.map((path) => (
              <TabsContent key={path.id} value={path.id}>
                <Card className="border-border/50 bg-card/50">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl mb-2">{path.title}</CardTitle>
                        <p className="text-muted-foreground mb-3">{path.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{path.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span>{path.level}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{path.courses.length} courses</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="gradient" size="lg">
                        <Play className="h-4 w-4 mr-2" />
                        Start Path
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {path.courses.map((course, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex-1">
                            <h4 className="font-medium">{course.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{course.duration}</span>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{course.rating}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h2 className="text-2xl font-semibold mb-6">Need Help Getting Started?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg">
              <Users className="h-4 w-4 mr-2" />
              Join Study Groups
            </Button>
            <Button variant="gradient" size="lg">
              <BookOpen className="h-4 w-4 mr-2" />
              Get Personalized Plan
            </Button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default StudyMaterials;

