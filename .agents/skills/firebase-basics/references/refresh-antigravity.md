# Refresh Antigravity Local Environment

Follow these steps to refresh Antigravity's local environment, ensuring that their agent skills and plugins are fully up-to-date.

Antigravity relies on `npx skills`. Updates should prioritize the global level; if skills are installed at the project level, omit the `--global` flag.

1. **Check for New Skills:** Check all available skills in the repository, run:
   ```bash
   npx -y skills add firebase/agent-skills --list
   ```
2. **Check the installed skills:** Check installed skills in both project and global levels, run:
   ```bash
   # Check project-level skills
   npx -y skills list --agent antigravity
   # Check global-level skills
   npx -y skills list --agent antigravity --global
   ```
3. **Update Installed Skills:** Run the following to update all currently installed skills to their latest versions:
   ```bash
   # Refresh project-level skills
   npx -y skills update --agent antigravity --yes
   # Refresh global-level skills
   npx -y skills update --agent antigravity --global --yes
   ```
4. **Add New Skills (If Any):** If step 1 and 2 revealed new skills, install them:
   ```bash
   # Add project-level skills
   npx -y skills add firebase/agent-skills --agent antigravity --skill "<NEW_SKILL_NAME>" --yes
   # Add global-level skills
   npx -y skills add firebase/agent-skills --agent antigravity --skill "<NEW_SKILL_NAME>" --global --yes
   ```
