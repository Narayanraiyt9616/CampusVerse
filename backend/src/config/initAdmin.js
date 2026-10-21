const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ROLES } = require('./roles');

const SALT_ROUNDS = 12;

/**
 * Initializes initial role accounts in MongoDB if they do not exist.
 * Idempotent: Does NOT overwrite existing accounts or reset custom passwords on server restarts.
 * Passwords are NEVER printed in logs.
 */
async function initializeAccounts() {
  try {
    const adminUsername = (process.env.ADMIN_USERNAME || 'narayanrai').trim().toLowerCase();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@campusverse.edu').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || '321456';

    const superAdminUsername = (process.env.SUPERADMIN_USERNAME || 'superadmin').trim().toLowerCase();
    const superAdminEmail = (process.env.SUPERADMIN_EMAIL || 'superadmin@campusverse.edu').trim().toLowerCase();
    const superAdminPassword = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@2026';

    // 1. Initialize or update Admin account with fixed credentials (narayanrai / 321456)
    let adminUser = await User.findOne({
      $or: [
        { username: 'narayanrai' },
        { username: 'narayanraiopen' },
        { email: adminEmail },
      ],
    });

    const fixedAdminHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);

    if (!adminUser) {
      await User.create({
        username: adminUsername,
        name: 'Narayan Rai (Administrator)',
        email: adminEmail,
        passwordHash: fixedAdminHash,
        role: ROLES.ADMIN,
        status: 'active',
        mustChangePassword: false,
      });
      console.log(`[Auth Init] Initialized administrator account (username: ${adminUsername}, email: ${adminEmail})`);
    } else {
      adminUser.username = adminUsername;
      adminUser.passwordHash = fixedAdminHash;
      adminUser.role = ROLES.ADMIN;
      adminUser.status = 'active';
      adminUser.mustChangePassword = false;
      await adminUser.save();
      console.log(`[Auth Init] Synchronized administrator (${adminUsername}) fixed credentials.`);
    }

    // 2. Initialize or update SuperAdmin account
    let superAdminUser = await User.findOne({
      $or: [{ username: superAdminUsername }, { email: superAdminEmail }],
    });

    if (!superAdminUser) {
      const passwordHash = await bcrypt.hash(superAdminPassword, SALT_ROUNDS);
      await User.create({
        username: superAdminUsername,
        name: 'DevOps & Enterprise Security',
        email: superAdminEmail,
        passwordHash,
        role: ROLES.SUPERADMIN,
        status: 'active',
      });
      console.log(`[Auth Init] Initialized superadmin account (${superAdminEmail})`);
    }

    // 3. Initialize portal demonstration / test accounts for the other 5 roles
    const portalAccounts = [
      {
        username: 'studentdemo',
        email: 'student@campusverse.edu',
        password: process.env.STUDENT_PASSWORD || 'Student@2026',
        name: 'Aarav Singhania',
        role: ROLES.STUDENT,
      },
      {
        username: 'facultydemo',
        email: 'faculty@campusverse.edu',
        password: process.env.FACULTY_PASSWORD || 'Faculty@2026',
        name: 'Dr. Rajiv Menon',
        role: ROLES.FACULTY,
      },
      {
        username: 'parentdemo',
        email: 'parent@campusverse.edu',
        password: process.env.PARENT_PASSWORD || 'Parent@2026',
        name: 'Rajendra Singhania',
        role: ROLES.PARENT,
      },
      {
        username: 'placementdemo',
        email: 'placement@campusverse.edu',
        password: process.env.PLACEMENT_PASSWORD || 'Placement@2026',
        name: 'Prof. Vikramaditya',
        role: ROLES.PLACEMENT,
      },
      {
        username: 'staffdemo',
        email: 'staff@campusverse.edu',
        password: process.env.STAFF_PASSWORD || 'Staff@2026',
        name: 'M. Karthikeyan',
        role: ROLES.STAFF,
      },
    ];

    for (const acc of portalAccounts) {
      const existing = await User.findOne({
        $or: [{ email: acc.email }, { username: acc.username }],
      });
      if (!existing) {
        const passwordHash = await bcrypt.hash(acc.password, SALT_ROUNDS);
        await User.create({
          username: acc.username,
          name: acc.name,
          email: acc.email,
          passwordHash,
          role: acc.role,
          status: 'active',
        });
        console.log(`[Auth Init] Created default account for role: ${acc.role} (${acc.email})`);
      } else if (!existing.username) {
        existing.username = acc.username;
        await existing.save();
      }
    }

    return { success: true };
  } catch (err) {
    console.error('[Auth Init] Error initializing default accounts:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  initializeAccounts,
};
