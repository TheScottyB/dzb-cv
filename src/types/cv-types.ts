export interface CVData {
  personalInfo: {
    name: {
      full: string;
      preferred: string;
    };
    contact: {
      email: string;
      phone: string;
    };
  };
  profiles: {
    linkedIn?: string;
  };
  cvTypes: {
    federal: {
      requirements: string[];
      format: string;
    };
    state: {
      requirements: string[];
      format: string;
    };
    private: {
      requirements: string[];
      format: string;
    };
  };
}
