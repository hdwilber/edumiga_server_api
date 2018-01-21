export const Types = [
  {
    id: 'public',
    name: 'Public',
    description: 'Public institution leaded by the government and its related administration.',
  },
  {
    id: 'private',
    name: 'Public',
    description: 'Private and profit institution'
  },
  {
    id: 'private-np',
    name: 'Private Non-profit',
    description: 'Private and non profit organization'
  },
  {
    id: 'unknown',
    name: 'Unknown',
    description: 'Unknown institution type'
  }
]

export const Levels = [
  {
    id: 'early',
    name: 'Early childhood',
    categories: [
      {
        id: 'preschool',
        name: 'Preschool',
      },
      {
        id: 'kindergarten',
        name: 'Kindergarten',
        description: '',
      },
      {
        id: 'nursery',
        name: 'Nursery',
        description: '',
      },
    ]
  },
  {
    id: 'primary',
    name: 'Primary',
    categories: [
      {
        id: 'elementary',
        name: 'Elementary School',
        description: '',
      },
      {
        id: 'middle',
        name: 'Middle School',
        description: '',
      },
      {
        id: 'comprenhensive',
        name: 'Comprehensive School',
        description: '',
      },
    ]
  },
  {
    id: 'secondary',
    name: 'Secondary',
    categories: [
      {
        id: 'secondary',
        name: 'Secondary School'
      }
    ]
  },
  {
    id: 'higher',
    name: 'Higher Education',
    categories: [
      {
        id: 'postdoc',
        name: 'PostDoc',
      },
      {
        id: 'phd',
        name: 'Philosophical Doctor',
      },
      {
        id: 'master',
        name: 'Master of Science'
      },
      {
        id: 'bachelor',
        name: 'Bachelor'
      },
      {
        id: 'upper-technician',
        name: 'Upper Technician'
      },
      {
        id: 'mid-technician',
        name: 'Mid Technician'
      }
    ]
  }
]

