import {Trainee} from '../models/trainee';
import {TestResult} from '../models/test-result';

// List of realistic subjects for test results
const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Literature',
  'History',
  'Geography',
  'Economics',
  'Statistics',
  'Foreign Languages',
  'Art History',
  'Music Theory',
  'Psychology',
  'Philosophy'
];

// List of common first names
const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Sarah',
  'Thomas', 'Karen', 'Charles', 'Nancy', 'Christopher', 'Lisa', 'Daniel', 'Margaret',
  'Matthew', 'Betty', 'Anthony', 'Sandra', 'Mark', 'Ashley', 'Donald', 'Dorothy',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Melissa', 'George', 'Deborah',
  'Timothy', 'Stephanie', 'Ronald', 'Rebecca', 'Edward', 'Laura', 'Jason', 'Sharon',
  'Jeffrey', 'Cynthia', 'Ryan', 'Kathleen', 'Jacob', 'Amy', 'Gary', 'Shirley'
];

// List of common last names
const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson',
  'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin',
  'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee',
  'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King', 'Wright', 'Lopez',
  'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson', 'Carter',
  'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans',
  'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook',
  'Morgan', 'Bell', 'Murphy', 'Bailey', 'Rivera', 'Cooper', 'Richardson', 'Cox'
];

// List of common cities
const CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'Fort Worth', 'Columbus', 'San Francisco', 'Charlotte', 'Indianapolis', 'Seattle',
  'Denver', 'Washington', 'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City',
  'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee',
  'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Long Beach', 'Kansas City',
  'Mesa', 'Atlanta', 'Colorado Springs', 'Raleigh', 'Omaha', 'Miami', 'Oakland',
  'Tulsa', 'Minneapolis', 'Cleveland', 'Wichita', 'Arlington', 'New Orleans'
];

// List of countries
const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France',
  'Spain', 'Italy', 'Japan', 'China', 'India', 'Brazil', 'Mexico', 'South Africa',
  'Russia', 'Sweden', 'Netherlands', 'Switzerland', 'Denmark', 'Norway', 'Finland',
  'Ireland', 'New Zealand', 'Singapore', 'South Korea'
];

/**
 * Generates a random integer between min and max (inclusive)
 */
function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random date between start and end dates
 */
function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generates a random email based on a name
 */
function generateEmail(name: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'protonmail.com'];
  const nameParts = name.toLowerCase().replace(/[^a-z ]/g, '').split(' ');
  const randomNum = getRandomInt(1, 999);
  const domain = domains[getRandomInt(0, domains.length - 1)];

  if (nameParts.length > 1) {
    return `${nameParts[0]}.${nameParts[1]}${randomNum}@${domain}`;
  } else {
    return `${nameParts[0]}${randomNum}@${domain}`;
  }
}

/**
 * Generates a random address
 */
function generateAddress(): string {
  const streetTypes = ['St', 'Ave', 'Blvd', 'Rd', 'Dr', 'Ln', 'Way', 'Pl', 'Ct'];
  const streetNames = ['Main', 'Oak', 'Pine', 'Maple', 'Cedar', 'Elm', 'Washington', 'Park', 'Lake', 'Hill',
    'River', 'View', 'Highland', 'Forest', 'Sunset', 'Spring', 'Meadow', 'Valley'];

  const number = getRandomInt(1, 9999);
  const street = streetNames[getRandomInt(0, streetNames.length - 1)];
  const type = streetTypes[getRandomInt(0, streetTypes.length - 1)];

  return `${number} ${street} ${type}`;
}

/**
 * Generates a random zip code
 */
function generateZipCode(): string {
  return String(getRandomInt(10000, 99999));
}

/**
 * Generates a list of random trainees
 * @param count Number of trainees to generate
 * @returns Array of Trainee objects
 */
export function generateTrainees(count: number): Trainee[] {
  const trainees: Trainee[] = [];
  const startDate = new Date(2020, 0, 1);
  const endDate = new Date();

  for (let i = 0; i < count; i++) {
    const firstName = FIRST_NAMES[getRandomInt(0, FIRST_NAMES.length - 1)];
    const lastName = LAST_NAMES[getRandomInt(0, LAST_NAMES.length - 1)];
    const fullName = `${firstName} ${lastName}`;
    const city = CITIES[getRandomInt(0, CITIES.length - 1)];
    const country = COUNTRIES[getRandomInt(0, COUNTRIES.length - 1)];

    trainees.push({
      id: i + 1,
      name: fullName,
      email: generateEmail(fullName),
      dateJoined: getRandomDate(startDate, endDate),
      address: generateAddress(),
      city: city,
      country: country,
      zip: generateZipCode()
    });
  }

  return trainees;
}

/**
 * Generates random test results for a set of trainees
 * @param trainees Array of trainees
 * @param minResultsPerTrainee Minimum number of test results per trainee
 * @param maxResultsPerTrainee Maximum number of test results per trainee
 * @returns Array of TestResult objects
 */
export function generateTestResults(
  trainees: Trainee[],
  minResultsPerTrainee: number = 3,
  maxResultsPerTrainee: number = 10
): TestResult[] {
  const results: TestResult[] = [];
  let resultId = 1;

  // Earliest test date is 7 days after the earliest joining date
  const earliestJoinDate = trainees.reduce(
    (earliest, trainee) => trainee.dateJoined < earliest ? trainee.dateJoined : earliest,
    new Date()
  );
  const startDate = new Date(earliestJoinDate);
  startDate.setDate(startDate.getDate() + 7);

  const endDate = new Date(); // Today

  trainees.forEach(trainee => {
    // Each trainee has a random number of test results
    const numResults = getRandomInt(minResultsPerTrainee, maxResultsPerTrainee);

    // Make sure trainee's test dates are after their joining date
    const traineeStartDate = new Date(trainee.dateJoined);
    traineeStartDate.setDate(traineeStartDate.getDate() + 7); // Add 7 days to joining date

    for (let i = 0; i < numResults; i++) {
      const subject = SUBJECTS[getRandomInt(0, SUBJECTS.length - 1)];
      // Generate a date between the trainee's start date and now
      const testDate = getRandomDate(traineeStartDate, endDate);

      results.push({
        id: resultId++,
        traineeId: trainee.id,
        traineeName: trainee.name,
        date: testDate,
        grade: getRandomInt(40, 100), // Grades between 40-100
        subject: subject
      });
    }
  });

  // Sort results by date, most recent first
  return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Generates a complete dataset with trainees and test results
 * @param traineeCount Number of trainees to generate
 * @param minResultsPerTrainee Minimum number of test results per trainee
 * @param maxResultsPerTrainee Maximum number of test results per trainee
 * @returns Object containing trainees and test results arrays
 */
export function generateMockData(
  traineeCount: number = 50,
  minResultsPerTrainee: number = 3,
  maxResultsPerTrainee: number = 10
) {
  const trainees = generateTrainees(traineeCount);
  const testResults = generateTestResults(trainees, minResultsPerTrainee, maxResultsPerTrainee);

  return {
    trainees,
    testResults
  };
}
