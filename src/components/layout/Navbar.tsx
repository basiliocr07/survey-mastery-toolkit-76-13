import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X, MessageSquare, FileText, Home, LogIn, LogOut, LayoutDashboard, FileBarChart, BarChart3, Users } from "lucide-react";
import { cn } from '@/lib/utils';
import { useToast } from "@/components/ui/use-toast";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

interface NavFeature {
  name: string;
  description: string;
  href: string;
  roles?: string[];
}

interface NavMenuItem {
  label: string;
  icon?: React.ReactNode;
  href: string;
  description?: string;
  roles: string[];
  features?: NavFeature[];
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [username, setUsername] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const role = localStorage.getItem('userRole') || '';
    const name = localStorage.getItem('username') || '';
    
    setIsLoggedIn(loggedIn);
    setUserRole(role);
    setUsername(name);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    
    setIsLoggedIn(false);
    setUserRole('');
    setUsername('');
    
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
    
    navigate('/');
  };

  const getFilteredNavItems = () => {
    const clientNavItems = [
      { path: '/', label: 'Home', icon: <Home className="w-4 h-4 mr-2" />, roles: ['client'] },
      { path: '/suggestions', label: 'Enviar Sugerencia', icon: <MessageSquare className="w-4 h-4 mr-2" />, roles: ['client'] },
      { path: '/requirements', label: 'Enviar Requerimiento', icon: <FileText className="w-4 h-4 mr-2" />, roles: ['client'] },
    ];

    const allNavItems = [
      { path: '/', label: 'Home', icon: <Home className="w-4 h-4 mr-2" />, roles: ['admin', ''] },
      { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 mr-2" />, roles: ['admin'] },
      { path: '/surveys', label: 'Surveys', icon: <FileBarChart className="w-4 h-4 mr-2" />, roles: ['admin'] },
      { path: '/results', label: 'Analysis', icon: <BarChart3 className="w-4 h-4 mr-2" />, roles: ['admin'] },
      { path: '/suggestions', label: 'Suggestions', icon: <MessageSquare className="w-4 h-4 mr-2" />, roles: ['admin', 'client'] },
      { path: '/customers', label: 'Customer Growth', icon: <Users className="w-4 h-4 mr-2" />, roles: ['admin'] },
      { path: '/requirements', label: 'Requirements', icon: <FileText className="w-4 h-4 mr-2" />, roles: ['admin', 'client'] },
      { path: '/advanced-requirements', label: 'Advanced Requirements', icon: <FileText className="w-4 h-4 mr-2" />, roles: ['admin'] },
    ];

    if (!isLoggedIn) {
      return allNavItems.filter(item => item.roles.includes(''));
    } else if (userRole.toLowerCase() === 'admin') {
      return allNavItems.filter(item => item.roles.includes('admin'));
    } else {
      return clientNavItems;
    }
  };

  const filteredNavItems = getFilteredNavItems();

  const getFilteredNavMenuItems = () => {
    const clientMenuItems: NavMenuItem[] = [
      {
        label: 'Home',
        icon: <Home className="w-4 h-4 mr-2" />,
        href: '/',
        description: 'Página principal',
        roles: ['client']
      },
      {
        label: 'Enviar Sugerencia',
        icon: <MessageSquare className="w-4 h-4 mr-2" />,
        href: '/suggestions',
        description: 'Enviar una nueva sugerencia',
        roles: ['client'],
        features: [
          { name: 'Nueva Sugerencia', description: 'Enviar una nueva sugerencia', href: '/suggestions#new', roles: ['client'] },
        ]
      },
      {
        label: 'Enviar Requerimiento',
        icon: <FileText className="w-4 h-4 mr-2" />,
        href: '/requirements',
        description: 'Enviar un nuevo requerimiento',
        roles: ['client'],
        features: [
          { name: 'Nuevo Requerimiento', description: 'Enviar un nuevo requerimiento', href: '/requirements#new', roles: ['client'] },
        ]
      }
    ];

    const allMenuItems: NavMenuItem[] = [
      {
        label: 'Home',
        icon: <Home className="w-4 h-4 mr-2" />,
        href: '/',
        description: 'Return to the main page',
        roles: ['admin', 'client', '']
      },
      {
        label: 'Dashboard',
        icon: <LayoutDashboard className="w-4 h-4 mr-2" />,
        href: '/dashboard',
        description: 'Overview of your latest activity',
        roles: ['admin'],
        features: [
          { name: 'Recent Surveys', description: 'View your most recent surveys', href: '/dashboard#surveys', roles: ['admin'] },
          { name: 'Latest Suggestions', description: 'Check customer suggestions', href: '/dashboard#suggestions', roles: ['admin'] },
          { name: 'Requirements', description: 'View latest requirements', href: '/dashboard#requirements', roles: ['admin'] },
        ]
      },
      {
        label: 'Surveys',
        icon: <FileBarChart className="w-4 h-4 mr-2" />,
        href: '/surveys',
        description: 'Create and manage surveys',
        roles: ['admin'],
        features: [
          { name: 'All Surveys', description: 'View all your surveys', href: '/surveys', roles: ['admin'] },
          { name: 'Create Survey', description: 'Build a new survey', href: '/create', roles: ['admin'] },
          { name: 'Survey Responses', description: 'View collected responses', href: '/results', roles: ['admin'] },
        ]
      },
      {
        label: 'Analysis',
        icon: <BarChart3 className="w-4 h-4 mr-2" />,
        href: '/results',
        description: 'Analyze survey results',
        roles: ['admin'],
        features: [
          { name: 'Data Visualization', description: 'View charts and graphs', href: '/results#charts', roles: ['admin'] },
          { name: 'Response Analytics', description: 'Detailed response analysis', href: '/results#analytics', roles: ['admin'] },
          { name: 'Export Data', description: 'Download survey results', href: '/results#export', roles: ['admin'] },
        ]
      },
      {
        label: 'Suggestions',
        icon: <MessageSquare className="w-4 h-4 mr-2" />,
        href: '/suggestions',
        description: 'Customer feedback and ideas',
        roles: ['admin', 'client'],
        features: [
          { name: 'All Suggestions', description: 'Browse customer suggestions', href: '/suggestions', roles: ['admin'] },
          { name: 'New Suggestion', description: 'Submit a new suggestion', href: '/suggestions#new', roles: ['admin', 'client'] },
          { name: 'Suggestion Reports', description: 'Analyze suggestion trends', href: '/suggestions#reports', roles: ['admin'] },
        ]
      },
      {
        label: 'Customer Growth',
        icon: <Users className="w-4 h-4 mr-2" />,
        href: '/customers',
        description: 'Manage and grow your customer base',
        roles: ['admin'],
        features: [
          { name: 'Customer List', description: 'View all customers', href: '/customers', roles: ['admin'] },
          { name: 'Customer Analysis', description: 'Analyze customer growth', href: '/customers#analysis', roles: ['admin'] },
          { name: 'Add Customer', description: 'Add a new customer', href: '/customers#add', roles: ['admin'] },
        ]
      },
      {
        label: 'Requirements',
        icon: <FileText className="w-4 h-4 mr-2" />,
        href: '/requirements',
        description: 'Project requirements and documentation',
        roles: ['admin', 'client'],
        features: [
          { name: 'All Requirements', description: 'View project requirements', href: '/requirements', roles: ['admin'] },
          { name: 'New Requirement', description: 'Submit a new requirement', href: '/requirements#new', roles: ['admin', 'client'] },
          { name: 'Advanced Requirements', description: 'Advanced requirements management', href: '/advanced-requirements', roles: ['admin'] },
          { name: 'Documentation', description: 'Project documentation', href: '/requirements#docs', roles: ['admin'] },
        ]
      },
      {
        label: 'About',
        href: '/about',
        description: 'Learn more about Execudata',
        roles: ['admin', 'client', '']
      }
    ];

    if (!isLoggedIn) {
      return allMenuItems.filter(item => item.roles.includes(''));
    } else if (userRole.toLowerCase() === 'admin') {
      return allMenuItems.filter(item => item.roles.includes('admin'));
    } else {
      return clientMenuItems;
    }
  };

  const filteredNavMenuItems = getFilteredNavMenuItems();

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
        isScrolled ? "glass shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link 
          to="/" 
          className="flex items-center space-x-2 font-bold text-xl tracking-tight transition-opacity duration-200 hover:opacity-80"
        >
          <span className="text-primary">SurveyMaster</span>
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {filteredNavMenuItems.map((item) => (
              <NavigationMenuItem key={item.label}>
                {item.features ? (
                  <>
                    <NavigationMenuTrigger className="h-9 px-3">
                      {item.icon}
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-4 w-[400px]">
                        <div className="flex flex-col gap-1">
                          <Link 
                            to={item.href}
                            className="text-sm font-medium leading-none mb-1 group flex items-center"
                          >
                            {item.icon}
                            {item.label}
                          </Link>
                          <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                          <div className="grid gap-2">
                            {item.features.map((feature) => (
                              <Link
                                key={feature.name}
                                to={feature.href}
                                className="group grid grid-cols-[20px_1fr] gap-1 rounded-md p-2 text-sm items-center hover:bg-accent hover:text-accent-foreground"
                              >
                                <div className="h-1 w-1 rounded-full bg-primary"></div>
                                <div>
                                  <div className="font-medium group-hover:underline">{feature.name}</div>
                                  <div className="text-xs text-muted-foreground">{feature.description}</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <Link to={item.href}>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      {item.icon}
                      {item.label}
                    </NavigationMenuLink>
                  </Link>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="hidden md:flex items-center space-x-2">
          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Hola, {username}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Salir</span>
              </Button>
            </div>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className="flex items-center space-x-1"
              >
                <Link to="/login">
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </Link>
              </Button>
            </>
          )}
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMobileMenu} 
          className="md:hidden"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      <div 
        className={cn(
          "fixed inset-0 bg-background z-40 md:hidden transition-all duration-300 flex flex-col",
          isMobileMenuOpen 
            ? "opacity-100 translate-x-0" 
            : "opacity-0 translate-x-full pointer-events-none"
        )}
      >
        <div className="flex flex-col pt-24 px-6 space-y-4">
          {filteredNavItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={cn(
                "px-4 py-3 rounded-md flex items-center text-lg",
                location.pathname === item.path 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          
          {isLoggedIn ? (
            <Button 
              variant="default" 
              onClick={handleLogout}
              className="w-full mt-4 flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión ({username})</span>
            </Button>
          ) : (
            <Link 
              to="/login"
              className="w-full mt-4"
            >
              <Button 
                variant="default" 
                className="w-full flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
