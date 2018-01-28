export const Types = [
  {
    value: 'public',
    text: 'Public',
    description: 'Public institution leaded by the government and its related administration.',
  },
  {
    value: 'private',
    text: 'Private',
    description: 'Private and profit institution'
  },
  {
    value: 'private-np',
    text: 'Private Non-profit',
    description: 'Private and non profit organization'
  },
  {
    value: 'mixed',
    text: 'Mixed',
    description: 'Public Institution with private help'
  }
]

export const Levels = [
  {
    value: 'early',
    text: 'Early childhood',
    categories: [
      {
        value: 'preschool',
        text: 'Preschool',
      },
      {
        value: 'kindergarten',
        text: 'Kindergarten',
        description: '',
      },
      {
        value: 'nursery',
        text: 'Nursery',
        description: '',
      },
    ]
  },
  {
    value: 'primary',
    text: 'Primary',
    categories: [
      {
        value: 'elementary',
        text: 'Elementary School',
        description: '',
      },
      {
        value: 'mvaluedle',
        text: 'Mvaluedle School',
        description: '',
      },
      {
        value: 'comprenhensive',
        text: 'Comprehensive School',
        description: '',
      },
    ]
  },
  {
    value: 'secondary',
    text: 'Secondary',
    categories: [
      {
        value: 'secondary',
        text: 'Secondary School'
      }
    ]
  },
  {
    value: 'higher',
    text: 'Higher Education',
    categories: [
      {
        value: 'postdoc',
        text: 'PostDoc',
      },
      {
        value: 'phd',
        text: 'Philosophical Doctor',
      },
      {
        value: 'master',
        text: 'Master of Science'
      },
      {
        value: 'bachelor',
        text: 'Bachelor'
      },
      {
        value: 'upper-technician',
        text: 'Upper Technician'
      },
      {
        value: 'mvalue-technician',
        text: 'Mvalue Technician'
      }
    ]
  }
]

export const AdminLevels = [
  {
    value: 'main',
    text: 'Institution',
  },
  {
    value: 'faculty',
    text: 'Faculty',
  },
  {
    value: 'department',
    text: 'Department',
  }
]
