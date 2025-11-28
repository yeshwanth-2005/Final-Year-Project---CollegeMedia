import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Briefcase, 
  Building2, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar,
  Star,
  Bookmark,
  ExternalLink,
  Filter,
  GraduationCap,
  Zap,
  Globe,
  Code,
  Palette,
  Database,
  Smartphone,
  Shield,
  CheckCircle
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data for jobs and internships
const mockJobs = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Solutions",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=TC",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120,000 - $150,000",
    experience: "5+ years",
    posted: "2 days ago",
    description: "We're looking for a talented Frontend Developer to join our team and help build amazing user experiences.",
    requirements: ["React", "TypeScript", "Node.js", "AWS"],
    benefits: ["Health Insurance", "401k", "Remote Work", "Flexible Hours"],
    category: "Frontend Development",
    isRemote: true,
    isFeatured: true,
    applications: 24
  },
  {
    id: "2",
    title: "Full Stack Engineer",
    company: "InnovateTech",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=IT",
    location: "New York, NY",
    type: "Full-time",
    salary: "$100,000 - $130,000",
    experience: "3+ years",
    posted: "1 week ago",
    description: "Join our dynamic team to build scalable web applications and contribute to product development.",
    requirements: ["JavaScript", "Python", "PostgreSQL", "Docker"],
    benefits: ["Competitive Salary", "Stock Options", "Learning Budget", "Team Events"],
    category: "Full Stack Development",
    isRemote: false,
    isFeatured: false,
    applications: 18
  },
  {
    id: "3",
    title: "DevOps Engineer",
    company: "CloudScale Inc",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=CS",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$110,000 - $140,000",
    experience: "4+ years",
    posted: "3 days ago",
    description: "Help us scale our infrastructure and implement CI/CD pipelines for our growing platform.",
    requirements: ["Kubernetes", "Docker", "AWS", "Terraform"],
    benefits: ["Health Benefits", "Remote Work", "Conference Budget", "Flexible PTO"],
    category: "DevOps",
    isRemote: true,
    isFeatured: true,
    applications: 15
  },
  {
    id: "4",
    title: "UI/UX Designer",
    company: "Creative Studios",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=CS",
    location: "Los Angeles, CA",
    type: "Full-time",
    salary: "$90,000 - $120,000",
    experience: "3+ years",
    posted: "5 days ago",
    description: "Create beautiful and intuitive user interfaces that delight our customers.",
    requirements: ["Figma", "Adobe Creative Suite", "User Research", "Prototyping"],
    benefits: ["Creative Freedom", "Health Insurance", "Professional Development", "Flexible Schedule"],
    category: "Design",
    isRemote: false,
    isFeatured: false,
    applications: 22
  },
  {
    id: "5",
    title: "Data Scientist",
    company: "DataFlow Analytics",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=DF",
    location: "Seattle, WA",
    type: "Full-time",
    salary: "$130,000 - $160,000",
    experience: "6+ years",
    posted: "1 day ago",
    description: "Join our data science team to build machine learning models and drive business insights.",
    requirements: ["Python", "TensorFlow", "SQL", "Statistics"],
    benefits: ["Competitive Salary", "Health Benefits", "Learning Resources", "Conference Attendance"],
    category: "Data Science",
    isRemote: true,
    isFeatured: true,
    applications: 31
  }
];

const mockInternships = [
  {
    id: "i1",
    title: "Software Engineering Intern",
    company: "TechCorp Solutions",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=TC",
    location: "San Francisco, CA",
    type: "Internship",
    duration: "3 months",
    stipend: "$5,000/month",
    experience: "Student",
    posted: "1 week ago",
    description: "Gain hands-on experience working on real projects with our engineering team.",
    requirements: ["JavaScript", "React", "Git", "Currently enrolled"],
    benefits: ["Mentorship", "Networking", "Potential Full-time Offer", "Learning Resources"],
    category: "Software Engineering",
    isRemote: false,
    isFeatured: true,
    applications: 45,
    startDate: "June 2024"
  },
  {
    id: "i2",
    title: "Data Science Intern",
    company: "DataFlow Analytics",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=DF",
    location: "Seattle, WA",
    type: "Internship",
    duration: "4 months",
    stipend: "$4,500/month",
    experience: "Student",
    posted: "2 weeks ago",
    description: "Work on real data science projects and learn from industry experts.",
    requirements: ["Python", "Basic ML", "SQL", "Currently enrolled"],
    benefits: ["Hands-on Experience", "Mentorship", "Networking", "Project Portfolio"],
    category: "Data Science",
    isRemote: true,
    isFeatured: false,
    applications: 38,
    startDate: "May 2024"
  },
  {
    id: "i3",
    title: "Product Design Intern",
    company: "Creative Studios",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=CS",
    location: "Los Angeles, CA",
    type: "Internship",
    duration: "3 months",
    stipend: "$4,000/month",
    experience: "Student",
    posted: "3 weeks ago",
    description: "Learn product design principles and work on real client projects.",
    requirements: ["Figma", "Design Thinking", "Portfolio", "Currently enrolled"],
    benefits: ["Design Mentorship", "Portfolio Building", "Client Experience", "Networking"],
    category: "Design",
    isRemote: false,
    isFeatured: false,
    applications: 28,
    startDate: "June 2024"
  },
  {
    id: "i4",
    title: "Marketing Intern",
    company: "Growth Marketing Co",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=GM",
    location: "Chicago, IL",
    type: "Internship",
    duration: "3 months",
    stipend: "$3,500/month",
    experience: "Student",
    posted: "1 month ago",
    description: "Gain experience in digital marketing and growth strategies.",
    requirements: ["Social Media", "Content Creation", "Analytics", "Currently enrolled"],
    benefits: ["Marketing Experience", "Campaign Management", "Analytics Skills", "Industry Contacts"],
    category: "Marketing",
    isRemote: true,
    isFeatured: false,
    applications: 35,
    startDate: "July 2024"
  }
];

const categories = [
  "All",
  "Frontend Development",
  "Full Stack Development",
  "Backend Development",
  "DevOps",
  "Data Science",
  "Design",
  "Marketing",
  "Software Engineering"
];

const locations = [
  "All Locations",
  "Remote",
  "San Francisco, CA",
  "New York, NY",
  "Austin, TX",
  "Los Angeles, CA",
  "Seattle, WA",
  "Chicago, IL"
];

const Jobs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedType, setSelectedType] = useState("all");
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  const handleApply = (jobId: string) => {
    setAppliedJobs(prev => new Set(prev).add(jobId));
    // In a real app, this would submit an application
  };

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || job.category === selectedCategory;
    const matchesLocation = selectedLocation === "All Locations" || 
                           (selectedLocation === "Remote" ? job.isRemote : job.location === selectedLocation);
    const matchesType = selectedType === "all" || job.type.toLowerCase().includes(selectedType);

    return matchesSearch && matchesCategory && matchesLocation && matchesType;
  });

  const filteredInternships = mockInternships.filter(internship => {
    const matchesSearch = internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         internship.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         internship.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || internship.category === selectedCategory;
    const matchesLocation = selectedLocation === "All Locations" || 
                           (selectedLocation === "Remote" ? internship.isRemote : internship.location === selectedLocation);
    const matchesType = selectedType === "all" || internship.type.toLowerCase().includes(selectedType);

    return matchesSearch && matchesCategory && matchesLocation && matchesType;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Frontend Development":
        return <Code className="h-4 w-4" />;
      case "Full Stack Development":
        return <Globe className="h-4 w-4" />;
      case "Backend Development":
        return <Database className="h-4 w-4" />;
      case "DevOps":
        return <Zap className="h-4 w-4" />;
      case "Data Science":
        return <Database className="h-4 w-4" />;
      case "Design":
        return <Palette className="h-4 w-4" />;
      case "Marketing":
        return <Users className="h-4 w-4" />;
      case "Software Engineering":
        return <Code className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold gradient-text mb-2">Jobs & Internships</h1>
          <p className="text-muted-foreground">
            Discover amazing opportunities and take the next step in your career
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search jobs, companies, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg bg-card/50 border-border/30 focus:bg-card focus:border-primary/50 transition-all duration-300 rounded-xl"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(category)}
                        {category}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {location}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Content Tabs */}
        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Jobs ({filteredJobs.length})
            </TabsTrigger>
            <TabsTrigger value="internships" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Internships ({filteredInternships.length})
            </TabsTrigger>
          </TabsList>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            {filteredJobs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className={`h-full hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 hover:bg-card ${
                      job.isFeatured ? 'ring-2 ring-primary/20' : ''
                    }`}>
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-border/30">
                              <img
                                src={job.logo}
                                alt={job.company}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg line-clamp-1">{job.title}</h3>
                              <p className="text-sm text-muted-foreground">{job.company}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {job.isFeatured && (
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                Featured
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Bookmark className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                            {job.isRemote && (
                              <Badge variant="outline" className="ml-2 text-xs">Remote</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{job.type}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            <span>{job.salary}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{job.experience}</span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {job.description}
                        </p>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Requirements</p>
                            <div className="flex flex-wrap gap-2">
                              {job.requirements.slice(0, 3).map((req) => (
                                <Badge key={req} variant="outline" className="text-xs">
                                  {req}
                                </Badge>
                              ))}
                              {job.requirements.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{job.requirements.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Posted {job.posted}</span>
                            <span className="text-muted-foreground">{job.applications} applications</span>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              variant="gradient" 
                              className="flex-1"
                              onClick={() => handleApply(job.id)}
                              disabled={appliedJobs.has(job.id)}
                            >
                              {appliedJobs.has(job.id) ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Applied
                                </>
                              ) : (
                                <>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Apply Now
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Internships Tab */}
          <TabsContent value="internships" className="space-y-6">
            {filteredInternships.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No internships found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredInternships.map((internship, index) => (
                  <motion.div
                    key={internship.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className={`h-full hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 hover:bg-card ${
                      internship.isFeatured ? 'ring-2 ring-primary/20' : ''
                    }`}>
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-border/30">
                              <img
                                src={internship.logo}
                                alt={internship.company}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg line-clamp-1">{internship.title}</h3>
                              <p className="text-sm text-muted-foreground">{internship.company}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {internship.isFeatured && (
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                Featured
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Bookmark className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{internship.location}</span>
                            {internship.isRemote && (
                              <Badge variant="outline" className="ml-2 text-xs">Remote</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{internship.duration}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            <span>{internship.stipend}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Start: {internship.startDate}</span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {internship.description}
                        </p>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Requirements</p>
                            <div className="flex flex-wrap gap-2">
                              {internship.requirements.slice(0, 3).map((req) => (
                                <Badge key={req} variant="outline" className="text-xs">
                                  {req}
                                </Badge>
                              ))}
                              {internship.requirements.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{internship.requirements.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Posted {internship.posted}</span>
                            <span className="text-muted-foreground">{internship.applications} applications</span>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              variant="gradient" 
                              className="flex-1"
                              onClick={() => handleApply(internship.id)}
                              disabled={appliedJobs.has(internship.id)}
                            >
                              {appliedJobs.has(internship.id) ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Applied
                                </>
                              ) : (
                                <>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Apply Now
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <h2 className="text-2xl font-semibold mb-6">Need Help with Your Application?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg">
              <Users className="h-4 w-4 mr-2" />
              Resume Review
            </Button>
            <Button variant="gradient" size="lg">
              <Briefcase className="h-4 w-4 mr-2" />
              Career Coaching
            </Button>
            <Button variant="outline" size="lg">
              <Bookmark className="h-4 w-4 mr-2" />
              Save Searches
            </Button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Jobs;

